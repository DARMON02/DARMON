
import React from 'react';
import { Notification } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Badge } from './ui/Badge';

interface Props {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export const NotificationList: React.FC<Props> = ({ notifications, onMarkRead }) => {
  const { t, language } = useI18n();

  // Helper to format time specifically for Uzbekistan
  const formatUzbekTime = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : (language === 'ru' ? 'ru-RU' : 'uz-UZ'), {
      timeZone: 'Asia/Tashkent',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(ts));
  };

  const formatUzbekDate = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : (language === 'ru' ? 'ru-RU' : 'uz-UZ'), {
      timeZone: 'Asia/Tashkent',
      day: 'numeric',
      month: 'short'
    }).format(new Date(ts));
  };

  const getTypeVariant = (type: string) => {
    if (type.includes('AUTO_FINISH')) return 'error';
    if (type.includes('MANUAL_FINISH')) return 'success';
    if (type.includes('MANUAL_PAUSE')) return 'warning';
    return 'info';
  };

  // Helper to resolve dynamic message
  const resolveMessage = (key: string, params?: Record<string, string | number>) => {
    let msg = t(key as any);
    if (!params) return msg;
    
    // Simple replacement of {param}
    Object.keys(params).forEach(pKey => {
      msg = msg.replace(`{${pKey}}`, String(params[pKey]));
    });
    return msg;
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
           <span className="text-2xl opacity-50">📭</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('notif_empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className={`
            relative group flex flex-col sm:flex-row gap-3 p-4 rounded-xl border-l-4 transition-all duration-200
            ${n.read 
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-90' 
              : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 shadow-sm'
            }
          `}
        >
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={getTypeVariant(n.type)} className="text-[10px] uppercase tracking-wider">
                {t(`type_${n.type}` as any)}
              </Badge>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <span>{formatUzbekDate(n.ts)}</span>
                <span className="opacity-50">•</span>
                <span>{formatUzbekTime(n.ts)}</span>
              </span>
              {!n.read && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">
              {resolveMessage(n.messageKey, n.messageParams)}
            </p>
            
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">{n.employeeName}</span>
              {n.employeePhone && <span>• {n.employeePhone}</span>}
            </div>
          </div>

          {/* Action (Desktop: Hover, Mobile: Always visible but subtle) */}
          {!n.read && (
            <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onMarkRead(n.id)}
                className="
                  px-3 py-1.5 rounded-lg text-xs font-medium 
                  bg-white dark:bg-gray-700 
                  text-blue-600 dark:text-blue-300 
                  border border-gray-200 dark:border-gray-600 
                  shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600
                  w-full sm:w-auto
                "
              >
                {t('notif_mark_read')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
