
import { WorkSession, User, SessionStats, Notification, GeoData } from '../types';
import { ConfigService } from './ConfigService';
import { NotificationService } from './NotificationService';
import { UserService } from './UserService';
import { LocationService } from './LocationService';

const STORAGE_KEY = "attendance:sessions";
let MANUAL_ACTION_IN_PROGRESS = false;

const generateId = () => Math.random().toString(36).substr(2, 9);

const getStoredSessions = (): WorkSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Storage corrupted, resetting", e);
    return [];
  }
};

const saveSessions = (sessions: WorkSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const AttendanceService = {
  getSessions: (userId: string): WorkSession[] => {
    const all = getStoredSessions();
    return all.filter(s => s.userId === userId);
  },

  getActiveSession: (userId: string): WorkSession | null => {
    const sessions = getStoredSessions();
    return sessions.find(s => s.userId === userId && s.status !== 'completed') || null;
  },

  calculateStats: (session: WorkSession, user: User): SessionStats => {
    const now = Date.now();
    const endTime = session.status === 'completed' && session.checkOutTime 
      ? session.checkOutTime 
      : now;

    let realPausedMs = 0;
    let realCurrentPauseMs = 0;

    session.pauses.forEach(pause => {
      const pStart = pause.start;
      const pEnd = pause.end || endTime; 
      const duration = Math.max(0, pEnd - pStart);
      realPausedMs += duration;
      if (!pause.end) {
        realCurrentPauseMs = duration;
      }
    });

    const totalDuration = Math.max(0, endTime - session.checkInTime);
    const realPaidMs = Math.max(0, totalDuration - realPausedMs);

    let finalPaidMs = realPaidMs;
    let finalPausedMs = realPausedMs;
    let finalCurrentPauseMs = realCurrentPauseMs;

    if (ConfigService.TEST_MODE) {
      finalPaidMs = realPaidMs * ConfigService.TIME_SCALE;
      finalPausedMs = realPausedMs * ConfigService.TIME_SCALE;
      finalCurrentPauseMs = realCurrentPauseMs * ConfigService.TIME_SCALE;
    }

    const hourlyRate = user.hourlyRate || 9700;
    const salaryEarned = (finalPaidMs / 3_600_000) * hourlyRate;

    return {
      paidMs: finalPaidMs,
      totalPausedMs: finalPausedMs,
      currentPauseMs: finalCurrentPauseMs,
      salaryEarned: Math.floor(salaryEarned),
    };
  },

  checkLocationAllowed: async (): Promise<boolean> => {
    try {
      const { inside } = await LocationService.isInsideWorkplace();
      return inside;
    } catch (e) {
      throw new Error("error_location_denied");
    }
  },

  startWork: (userId: string): WorkSession => {
    const existing = AttendanceService.getActiveSession(userId);
    if (existing) {
      throw new Error("ACTIVE_SESSION_EXISTS");
    }

    const newSession: WorkSession = {
      id: generateId(),
      userId,
      status: 'active',
      checkInTime: Date.now(),
      pauses: [],
    };

    const sessions = getStoredSessions();
    sessions.push(newSession);
    saveSessions(sessions);

    console.log("START_WORK", userId, newSession.id);
    return newSession;
  },

  pauseWork: (userId: string, type: 'manual' | 'auto' = 'manual'): WorkSession => {
    if (type === 'manual') {
        MANUAL_ACTION_IN_PROGRESS = true;
        console.log("MANUAL_START: pauseWork");
    }

    try {
        const sessions = getStoredSessions();
        const index = sessions.findIndex(s => s.userId === userId && (s.status === 'active' || s.status.startsWith('paused')));
        
        if (index === -1) throw new Error("NO_ACTIVE_SESSION_TO_PAUSE");

        const session = sessions[index];
        
        if (session.status === `paused_${type}`) return session;

        const lastPause = session.pauses[session.pauses.length - 1];
        if (lastPause && !lastPause.end) {
          lastPause.end = Date.now();
        }

        session.status = type === 'manual' ? 'paused_manual' : 'paused_auto';
        session.pauses.push({ start: Date.now(), type });

        saveSessions(sessions);
        console.log(`PAUSE_${type.toUpperCase()}_START`, userId, session.id);

        if (type === 'manual') {
          const user = UserService.getUserById(userId);
          NotificationService.add({
            type: "MANUAL_PAUSE",
            employeeId: userId,
            employeeName: user?.name || "Unknown",
            employeePhone: user?.phone,
            ropId: user?.managerRopId || undefined, 
            messageKey: "notif_MANUAL_PAUSE",
            messageParams: { 
              name: user?.name || userId,
              phone: user?.phone || "" 
            },
            meta: { 
              pauseType: 'manual', 
              pauseStartedAt: Date.now(),
              phone: user?.phone
            }
          });
        } 

        return session;
    } finally {
        if (type === 'manual') {
            MANUAL_ACTION_IN_PROGRESS = false;
            console.log("MANUAL_END: pauseWork");
        }
    }
  },

  resumeWork: (userId: string, type: 'manual' | 'auto' = 'manual'): WorkSession => {
    if (type === 'manual') {
        MANUAL_ACTION_IN_PROGRESS = true;
        console.log("MANUAL_START: resumeWork");
    }

    try {
        const sessions = getStoredSessions();
        const index = sessions.findIndex(s => s.userId === userId && (s.status === 'paused_manual' || s.status === 'paused_auto'));
        
        if (index === -1) throw new Error("NO_PAUSED_SESSION_TO_RESUME");

        const session = sessions[index];
        const lastPause = session.pauses[session.pauses.length - 1];
        
        if (lastPause && !lastPause.end) {
          lastPause.end = Date.now();
        }

        session.status = 'active';
        saveSessions(sessions);
        console.log("PAUSE_END", userId, session.id);

        if (type === 'auto') {
          const user = UserService.getUserById(userId);
          NotificationService.add({
            type: "AUTO_RESUME",
            employeeId: userId,
            employeeName: user?.name || "Unknown",
            employeePhone: user?.phone,
            ropId: user?.managerRopId || undefined,
            messageKey: "notif_AUTO_RESUME",
            messageParams: { 
              name: user?.name || userId,
              phone: user?.phone || ""
            },
            meta: { 
              resumeType: 'auto', 
              resumeAt: Date.now(),
              phone: user?.phone 
            }
          });
        }

        return session;
    } finally {
        if (type === 'manual') {
            MANUAL_ACTION_IN_PROGRESS = false;
            console.log("MANUAL_END: resumeWork");
        }
    }
  },

  finishWork: (userId: string, isAuto: boolean = false, reason?: string): WorkSession => {
    if (!isAuto) {
        MANUAL_ACTION_IN_PROGRESS = true;
        console.log("MANUAL_START: finishWork");
    }

    try {
        const sessions = getStoredSessions();
        const index = sessions.findIndex(s => s.userId === userId && s.status !== 'completed');
        
        if (index === -1) throw new Error("NO_SESSION_TO_FINISH");

        const session = sessions[index];
        const now = Date.now();

        if (session.status === 'paused_manual' || session.status === 'paused_auto') {
           const lastPause = session.pauses[session.pauses.length - 1];
           if (lastPause && !lastPause.end) {
             lastPause.end = now;
           }
        }

        const statusBefore = session.status;
        session.status = 'completed';
        session.checkOutTime = now;

        saveSessions(sessions);
        
        const user = UserService.getUserById(userId);
        const stats = AttendanceService.calculateStats(session, user!);
        const workedMinNet = Math.floor(stats.paidMs / 60000);

        if (!isAuto) {
          NotificationService.add({
            type: "MANUAL_FINISH",
            employeeId: userId,
            employeeName: user?.name || "Unknown",
            employeePhone: user?.phone,
            ropId: user?.managerRopId || undefined,
            messageKey: "notif_MANUAL_FINISH",
            messageParams: { 
              name: user?.name || userId,
              phone: user?.phone || ""
            },
            meta: {
                recordId: session.id,
                statusBefore: statusBefore,
                statusAfter: "completed",
                workedMinNet: workedMinNet,
                phone: user?.phone
            }
          });
        }

        return session;
    } finally {
        if (!isAuto) {
            MANUAL_ACTION_IN_PROGRESS = false;
            console.log("MANUAL_END: finishWork");
        }
    }
  },

  /**
   * STRICT Geo Rule Evaluator
   * 1. If Active AND Outside (100m) -> Auto Pause (Immediate)
   * 2. If Auto Paused AND Inside -> Auto Resume
   * 3. If Auto Paused AND Outside > 30 mins -> Auto Finish
   */
  evaluateGeoRules: (userId: string, geo: GeoData): { changed: boolean; recordUpdated?: WorkSession; notifications: Notification[]; reason?: string } => {
    if (MANUAL_ACTION_IN_PROGRESS) {
        console.log("GEO_RULE_EVAL: SKIPPED (Manual Action In Progress)");
        return { changed: false, notifications: [] };
    }

    const sessions = getStoredSessions();
    const index = sessions.findIndex(s => s.userId === userId && s.status !== 'completed');
    
    if (index === -1) return { changed: false, notifications: [] };

    const session = sessions[index];
    const user = UserService.getUserById(userId);
    const userName = user?.name || userId;
    const userPhone = user?.phone || "";
    const userRole = user?.role || "EMPLOYEE";
    
    let changed = false;
    let notifications: Notification[] = [];
    let reason = "";

    session.lastGeo = geo;
    
    // DEBUG LOG FOR VISIBILITY
    console.log("GEO_RULE_EVAL:", { 
      userId, 
      status: session.status, 
      dist: geo.distanceM, 
      inside: geo.inside, 
      limit: LocationService.getLocationConfig()?.radius || 100 
    });

    // RULE 1: If Active AND Outside -> Auto Pause
    if (session.status === 'active') {
      if (!geo.inside) {
        session.status = 'paused_auto';
        session.outsideSince = session.outsideSince ?? geo.ts;
        session.pauses.push({ start: geo.ts, type: 'auto' });
        
        changed = true;
        reason = "OUTSIDE_WORKPLACE";

        const notif = NotificationService.add({
          type: "OUTSIDE_WARNING",
          employeeId: userId,
          employeeName: userName,
          employeePhone: userPhone,
          ropId: user?.managerRopId,
          messageKey: "notif_AUTO_PAUSE",
          messageParams: { name: userName },
          meta: { 
            employeeId: userId,
            employeeRole: userRole,
            distanceM: geo.distanceM, 
            inside: geo.inside, 
            outsideSince: session.outsideSince 
          }
        });
        notifications.push(notif);
        console.log("GEO_RULE_ACTION: Auto Paused (Outside)");
      }
    }
    // RULE 2: If Auto Paused...
    else if (session.status === 'paused_auto') {
      // ...AND Inside -> Auto Resume
      if (geo.inside) {
        const lastPause = session.pauses[session.pauses.length - 1];
        if (lastPause && !lastPause.end) {
          lastPause.end = geo.ts;
        }
        
        session.status = 'active';
        session.outsideSince = undefined;
        
        changed = true;
        reason = "RETURNED_INSIDE";

        const notif = NotificationService.add({
          type: "AUTO_RESUME",
          employeeId: userId,
          employeeName: userName,
          employeePhone: userPhone,
          ropId: user?.managerRopId,
          messageKey: "notif_AUTO_RESUME",
          messageParams: { name: userName },
          meta: { 
            employeeRole: userRole,
            resumeType: 'auto', 
            resumeAt: geo.ts 
          }
        });
        notifications.push(notif);
        console.log("GEO_RULE_ACTION: Auto Resumed (Inside)");
      } 
      // ...AND Outside -> Check 30min limit
      else {
        if (session.outsideSince) {
          const elapsed = geo.ts - session.outsideSince;
          const limitMs = ConfigService.ms(30);
          
          if (elapsed >= limitMs) {
            const lastPause = session.pauses[session.pauses.length - 1];
            if (lastPause && !lastPause.end) {
              lastPause.end = geo.ts;
            }
            
            session.status = 'completed';
            session.checkOutTime = geo.ts;
            
            changed = true;
            reason = "OUTSIDE_TIMEOUT";

            const notif = NotificationService.add({
              type: "AUTO_FINISH",
              employeeId: userId,
              employeeName: userName,
              employeePhone: userPhone,
              ropId: user?.managerRopId,
              messageKey: "notif_AUTO_FINISH_auto",
              messageParams: { name: userName, limit: 30 },
              meta: { 
                employeeRole: userRole,
                rule: 'outside_limit_exceeded', 
                thresholdMin: 30,
                outsideSince: session.outsideSince
              }
            });
            notifications.push(notif);
            console.log("GEO_RULE_ACTION: Auto Finished (Timeout)");
          }
        } else {
            session.outsideSince = geo.ts;
            changed = true; 
        }
      }
    }

    if (changed) {
      saveSessions(sessions);
    }
    
    return { changed, recordUpdated: changed ? session : undefined, notifications, reason }; 
  },

  /**
   * Pure time-based rule evaluator
   */
  evaluateTimeRules: (userId: string): { changed: boolean; notifications: Notification[] } => {
    if (MANUAL_ACTION_IN_PROGRESS) {
        return { changed: false, notifications: [] };
    }

    const sessions = getStoredSessions();
    const session = sessions.find(s => s.userId === userId && s.status !== 'completed');
    
    if (!session) return { changed: false, notifications: [] };

    const now = Date.now();
    let changed = false;
    const notifications: Notification[] = [];
    const user = UserService.getUserById(userId);
    const userName = user?.name || userId;
    const userPhone = user?.phone || "";

    // RULE: Manual pause > 120m -> Completed
    if (session.status === 'paused_manual') {
      const lastPause = session.pauses[session.pauses.length - 1];
      if (lastPause && !lastPause.end) {
        const elapsed = now - lastPause.start;
        if (elapsed >= ConfigService.ms(120)) {
           lastPause.end = now;
           session.status = 'completed';
           session.checkOutTime = now;
           
           changed = true;
           saveSessions(sessions);

           const notif = NotificationService.add({
             type: "AUTO_FINISH",
             employeeId: userId,
             employeeName: userName,
             employeePhone: userPhone,
             ropId: user?.managerRopId || undefined,
             messageKey: "notif_AUTO_FINISH_manual",
             messageParams: { 
               name: userName, 
               limit: 120,
               phone: userPhone
             },
             meta: { 
               rule: 'pause_manual_exceeded', 
               thresholdMin: 120,
               phone: userPhone
             }
           });
           notifications.push(notif);
           console.log("TIME_RULE: Manual pause exceeded limit. Auto-finished.");
        }
      }
    }
    // RULE: Auto pause > 30m -> Completed
    else if (session.status === 'paused_auto') {
      const lastPause = session.pauses[session.pauses.length - 1];
      if (lastPause && !lastPause.end) {
        const elapsed = now - lastPause.start;
        if (elapsed >= ConfigService.ms(30)) {
           lastPause.end = now;
           session.status = 'completed';
           session.checkOutTime = now;
           
           changed = true;
           saveSessions(sessions);

           const notif = NotificationService.add({
             type: "AUTO_FINISH",
             employeeId: userId,
             employeeName: userName,
             employeePhone: userPhone,
             ropId: user?.managerRopId || undefined,
             messageKey: "notif_AUTO_FINISH_auto",
             messageParams: { 
               name: userName, 
               limit: 30,
               phone: userPhone 
             },
             meta: { 
               rule: 'pause_auto_exceeded', 
               thresholdMin: 30,
               phone: userPhone
             }
           });
           notifications.push(notif);
           console.log("TIME_RULE: Auto pause exceeded limit. Auto-finished.");
        }
      }
    }

    return { changed, notifications };
  },

  evaluateRules: async (userId: string): Promise<{ changed: boolean; notifications: Notification[] }> => {
    return AttendanceService.evaluateTimeRules(userId);
  }
};
