
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { AttendanceService } from '../services/AttendanceService';
import { LocationService, LocationResult } from '../services/LocationService';
import { NotificationService } from '../services/NotificationService';
import { GeoService } from '../services/GeoService';
import { WorkSession, User, SessionStats, GeoData, Notification } from '../types';
import { useI18n } from '../i18n/useI18n';
import { AuthService } from '../services/AuthService';
import { ConfigService } from '../services/ConfigService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GeoDebugPanel } from '../components/GeoDebugPanel';

export const SalesManagerScreen: React.FC = () => {
  const { t } = useI18n();
  const currentUser = AuthService.getCurrentUser();
  
  const effectiveUser = useMemo((): User => {
    if (currentUser) {
      return {
        ...currentUser,
        hourlyRate: currentUser.hourlyRate || 9700, 
        payType: 'HOURLY'
      };
    }
    return {
      id: "demo",
      phone: "0000",
      name: "Demo User",
      role: "EMPLOYEE",
      payType: "HOURLY",
      hourlyRate: 9700,
      boundDeviceId: null
    };
  }, [currentUser]);

  const [session, setSession] = useState<WorkSession | null>(null);
  const [stats, setStats] = useState<SessionStats>({ paidMs: 0, totalPausedMs: 0, currentPauseMs: 0, salaryEarned: 0 });
  const [error, setError] = useState<string | null>(null);
  
  // Rule States
  const [autoFinishMsg, setAutoFinishMsg] = useState<string | null>(null);

  // Notification Debug State
  const [lastNotif, setLastNotif] = useState<{type: string, msg: string} | null>(null);

  // GPS States
  const [gpsInside, setGpsInside] = useState<boolean | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locInfo, setLocInfo] = useState<LocationResult | null>(null);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  const timerRef = useRef<number | null>(null);
  // Replaces direct watchRef. Holds the unsubscribe function from GeoService.
  const stopWatchRef = useRef<(() => void) | null>(null);

  const refreshSession = useCallback(() => {
    const active = AttendanceService.getActiveSession(effectiveUser.id);
    setSession(active);
    if (active) {
      setStats(AttendanceService.calculateStats(active, effectiveUser));
    } else {
      setStats({ paidMs: 0, totalPausedMs: 0, currentPauseMs: 0, salaryEarned: 0 });
    }
  }, [effectiveUser.id]);

  useEffect(() => { 
    refreshSession();
    GeoService.checkPermission().then(p => setPermissionStatus(p));
  }, [refreshSession]);

  const updateLastNotif = () => {
    const all = NotificationService.getAll();
    if (all.length > 0) {
      const latest = all[0];
      if (latest.employeeId === effectiveUser.id) {
         setLastNotif({
           type: latest.type,
           msg: latest.messageKey 
         });
      }
    }
  };

  // 1. TIME RULE POLLER
  useEffect(() => {
    if (!session || session.status === 'completed') return;

    const interval = setInterval(() => {
      const result = AttendanceService.evaluateTimeRules(effectiveUser.id);
      if (result.changed) {
        refreshSession();
        if (result.notifications.find(n => n.type === 'AUTO_FINISH')) {
          setAutoFinishMsg(t('auto_finished_msg'));
        }
        if (result.notifications.length > 0) {
           const latest = result.notifications[0];
           setLastNotif({ type: latest.type, msg: latest.messageKey });
        }
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [effectiveUser.id, refreshSession, t, session?.status]);

  // 2. REAL-TIME GPS MOTOR
  const handlePositionUpdate = useCallback((lat: number, lng: number, accuracy: number, source: "REAL" | "TEST") => {
    const now = Date.now();
    
    const config = LocationService.getLocationConfig();
    const dist = LocationService.calculateDistance(lat, lng, config.latitude, config.longitude);
    const inside = dist <= config.radius;
    const distanceM = Math.round(dist);

    setDistance(distanceM);
    setGpsInside(inside);
    setLocInfo({ lat, lng, accuracy, source, timestamp: now });
    setLastGpsUpdate(now);
    setGpsError(null); // Clear previous errors

    // Eval Rules
    const geoData: GeoData = { lat, lng, ts: now, distanceM, inside, source };
    const result = AttendanceService.evaluateGeoRules(effectiveUser.id, geoData);
    
    if (result.changed) {
      refreshSession();
      if (result.notifications.find(n => n.type === 'AUTO_FINISH')) {
         setAutoFinishMsg(t('auto_finished_msg'));
      }
    }
  }, [effectiveUser.id, refreshSession, t]);

  useEffect(() => {
    // Only watch if working or auto-paused
    const shouldWatch = session && (session.status === 'active' || session.status === 'paused_auto');

    // Clean up previous watch if it exists
    if (stopWatchRef.current) {
      stopWatchRef.current();
      stopWatchRef.current = null;
    }

    if (!shouldWatch) return;

    if (!ConfigService.GPS_WATCH_ENABLED) return;

    // Start robust watch via GeoService
    stopWatchRef.current = GeoService.watchLocation(
      (pos) => {
        handlePositionUpdate(pos.lat, pos.lng, pos.accuracy, pos.source);
      },
      (err) => {
         setGpsError(err.userMessage);
         // Also update permission state just in case
         GeoService.checkPermission().then(p => setPermissionStatus(p));
      }
    );

    return () => {
      if (stopWatchRef.current) {
        stopWatchRef.current();
        stopWatchRef.current = null;
      }
    };
  }, [session?.status, session?.id, handlePositionUpdate]);


  // 3. VISUAL TIMER
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    
    const isPaused = session?.status.startsWith('paused');

    if (session && (session.status === 'active' || isPaused)) {
      setStats(AttendanceService.calculateStats(session, effectiveUser));
      const tickMs = ConfigService.TEST_MODE ? (1000 / ConfigService.TIME_SCALE) : 1000;
      
      timerRef.current = window.setInterval(() => {
        setStats(AttendanceService.calculateStats(session, effectiveUser));
      }, tickMs);
    } 

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.id, session?.status, effectiveUser]);


  // Test Controls Handlers
  const handleTestMove = (type: 'IN' | 'OUT' | 'NUDGE_PLUS' | 'NUDGE_MINUS') => {
    if (!ConfigService.GPS_TEST_MODE) {
      alert("GPS TEST MODE is OFF. Enable it in ConfigService.ts to use these buttons.");
      return;
    }
    const config = LocationService.getLocationConfig();
    const currentTest = GeoService.getTestLocation();
    
    if (type === 'IN') {
      GeoService.setTestLocation(config.latitude, config.longitude);
    } else if (type === 'OUT') {
      GeoService.setTestLocation(config.latitude + 0.01, config.longitude);
    } else if (type === 'NUDGE_PLUS') {
      GeoService.setTestLocation(currentTest.lat + 0.0009, currentTest.lng);
    } else if (type === 'NUDGE_MINUS') {
      GeoService.setTestLocation(currentTest.lat - 0.0009, currentTest.lng);
    }
  };

  const handleStart = async () => { 
    try { 
      setError(null); 
      setAutoFinishMsg(null); 
      
      // Initial Check
      const pos = await LocationService.getCurrentLocation();
      const config = LocationService.getLocationConfig();
      const dist = LocationService.calculateDistance(pos.lat, pos.lng, config.latitude, config.longitude);
      const isInside = dist <= config.radius;

      if (!isInside) {
        throw new Error("error_outside_workplace");
      }
      
      handlePositionUpdate(pos.lat, pos.lng, pos.accuracy, pos.source);
      setSession(AttendanceService.startWork(effectiveUser.id)); 
    } catch (e: any) { 
      const msg = e.userMessage || t(e.message) || e.message;
      setError(msg); 
    } 
  };

  const handlePause = () => { 
      try { 
          setError(null); 
          setSession(AttendanceService.pauseWork(effectiveUser.id, 'manual'));
          updateLastNotif();
      } catch (e: any) { 
          setError(e.message); 
      } 
  };
  
  const handleResume = () => { 
      try { 
          setError(null); 
          setSession(AttendanceService.resumeWork(effectiveUser.id)); 
          updateLastNotif();
      } catch (e: any) { 
          setError(e.message); 
      } 
  };
  
  const handleFinish = () => { 
    try { 
      setError(null); 
      const s = AttendanceService.finishWork(effectiveUser.id); 
      setStats(AttendanceService.calculateStats(s, effectiveUser)); 
      setSession(null); 
      updateLastNotif();
      alert(t('work_finished')); 
    } catch (e: any) { 
      setError(e.message); 
    } 
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('uz-UZ').format(amount);
  const isPaused = session?.status.startsWith('paused');
  const isAutoPaused = session?.status === 'paused_auto';

  const getStatusVariant = () => {
    if (session?.status === 'active') return 'success';
    if (isAutoPaused) return 'error'; 
    if (isPaused) return 'warning';
    return 'neutral';
  };

  return (
    <div className="w-full space-y-6 pb-20 relative">
      
      {/* TEST CONTROLS PANEL */}
      {ConfigService.GPS_TEST_MODE && (
        <div className="fixed bottom-20 right-4 z-40 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-orange-300 dark:border-orange-800 w-64">
           <h4 className="text-xs font-bold text-orange-600 mb-2 uppercase">Test GPS Controls</h4>
           <div className="grid grid-cols-2 gap-2">
             <button onClick={() => handleTestMove('IN')} className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded hover:bg-green-200">
               Set IN (Work)
             </button>
             <button onClick={() => handleTestMove('OUT')} className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded hover:bg-red-200">
               Set OUT (+1km)
             </button>
           </div>
           <div className="mt-2 text-[10px] text-gray-500 font-mono text-center">
             Current Fake: {GeoService.getTestLocation().lat.toFixed(4)}, {GeoService.getTestLocation().lng.toFixed(4)}
           </div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
         <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
            <span className="text-[10px] text-gray-400 font-mono">Last GPS: {new Date(lastGpsUpdate).toLocaleTimeString()}</span>
         </div>
         <Badge variant={getStatusVariant()} className="text-sm px-3 py-1">
           {session?.status === 'active' ? t('status_active') : isAutoPaused ? t('type_AUTO_PAUSE') : isPaused ? t('status_paused') : t('status_none')}
         </Badge>
      </div>

      {/* LOCATION & DEBUG BLOCK */}
      <Card padding="sm" className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
         <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest">{t('gps_status')}</h4>
            <Badge variant={locInfo?.source === 'TEST' ? 'warning' : 'neutral'} className="text-[10px]">
              {locInfo?.source === 'TEST' ? t('source_test') : t('source_real')}
            </Badge>
         </div>
         
         <div className="grid grid-cols-2 gap-4 mt-3">
             <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('distance_label')}</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white font-mono">
                  {distance !== null ? `${distance}m` : '-'}
                </span>
             </div>
             <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Zone Status</span>
                <span className={`text-sm font-bold ${gpsInside ? 'text-green-600' : 'text-red-600'}`}>
                   {gpsInside === true ? `✅ ${t('gps_inside')}` : gpsInside === false ? `⛔ ${t('gps_outside')}` : 'Checking...'}
                </span>
             </div>
         </div>

         {/* COMPREHENSIVE DEBUG PANEL */}
         <GeoDebugPanel 
            info={locInfo || {}} 
            error={gpsError || error} 
            permission={permissionStatus} 
            distance={distance}
            loading={!locInfo && !gpsError}
            onRefresh={async () => {
              // Force refresh logic
              setPermissionStatus(await GeoService.checkPermission());
              try {
                const pos = await LocationService.getCurrentLocation();
                handlePositionUpdate(pos.lat, pos.lng, pos.accuracy, pos.source);
              } catch(e: any) {
                setGpsError(e.userMessage || e.message);
              }
            }}
         />

         {isPaused && (
           <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 text-xs font-bold">
             <span className={isAutoPaused ? "text-red-600" : "text-orange-600"}>
               Reason: {isAutoPaused ? "Hududdan chiqildi (AUTO)" : "Xodim pauza qo‘ydi (MANUAL)"}
             </span>
           </div>
         )}
      </Card>

      {/* Timer Section */}
      <div className="text-center py-6">
        <div className={`text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums leading-none ${
          isAutoPaused ? 'text-red-500 animate-pulse' :
          isPaused ? 'text-orange-500 dark:text-orange-400' : 'text-gray-900 dark:text-white'
        }`}>
          {isPaused ? formatTime(stats.currentPauseMs) : formatTime(stats.paidMs)}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 grid gap-4">
        {!session && (
          <Button onClick={handleStart} fullWidth className="h-14 text-lg shadow-lg">
            {t('start_work')}
          </Button>
        )}
        {session?.status === 'active' && (
          <Button onClick={handlePause} variant="secondary" fullWidth className="h-14 text-lg border-orange-200 text-orange-700">
            {t('pause_work')}
          </Button>
        )}
        {isPaused && (
          <Button onClick={handleResume} variant="primary" fullWidth className="h-14 text-lg">
            {t('resume_work')}
          </Button>
        )}
        {session && (
          <Button onClick={handleFinish} variant="danger" fullWidth className="h-14 text-lg mt-2">
            {t('finish_work')}
          </Button>
        )}
      </div>

    </div>
  );
};
