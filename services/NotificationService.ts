
import { Notification } from '../types';

const NOTIFICATIONS_KEY = "hr.notifications.v1";

export const NotificationService = {
  getAll: (): Notification[] => {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      // Sort newest first
      return list.sort((a: Notification, b: Notification) => b.ts - a.ts);
    } catch (e) {
      console.error("Failed to load notifications", e);
      return [];
    }
  },

  /**
   * Add a new notification.
   * id and ts are auto-generated if not provided.
   */
  add: (n: Omit<Notification, "id" | "ts"> & { ts?: number }): Notification => {
    const list = NotificationService.getAll();
    
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      ts: Date.now(),
      read: false,
      ...n
    };

    list.unshift(newNotification); // Add to top
    // Limit storage to last 100 notifications to prevent overflow
    if (list.length > 100) list.pop();
    
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
      console.log("NOTIFICATION_ADDED", newNotification.type, newNotification.messageKey);
    } catch (e) {
      console.error("Failed to save notification", e);
    }
    
    return newNotification;
  },

  markRead: (id: string) => {
    const list = NotificationService.getAll();
    const target = list.find(n => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    }
  },

  markAllReadForRop: (ropId: string) => {
    const list = NotificationService.getAll();
    let changed = false;
    list.forEach(n => {
      // Mark read if it belongs to this ROP (or is broadcast) AND is currently unread
      if ((!n.ropId || n.ropId === ropId) && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    }
  },

  getForRop: (ropId: string): Notification[] => {
    const all = NotificationService.getAll();
    // Return notifications specifically for this ROP (n.ropId === ropId)
    // OR broadcast notifications (n.ropId is null/undefined)
    return all.filter(n => !n.ropId || n.ropId === ropId);
  }
};
