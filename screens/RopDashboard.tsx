
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../services/NotificationService';
import { UserService } from '../services/UserService';
import { Notification, User } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { NotificationList } from '../components/NotificationList';

export const RopDashboard: React.FC = () => {
  const currentUser = AuthService.getCurrentUser();
  const { t } = useI18n();
  
  // State for Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // State for Staff (Restored)
  const [employees, setEmployees] = useState<User[]>([]);

  const loadData = () => {
    if (currentUser) {
      // Load Notifications specifically for this ROP
      const notifList = NotificationService.getForRop(currentUser.id);
      setNotifications(notifList);
      
      // Load Staff
      const allUsers = UserService.getAllUsers();
      // Filter for Employees/Sales Managers that might report to ROP (or all if ROP sees everything)
      const staff = allUsers.filter(u => u.role === 'EMPLOYEE' || u.role === 'SALES_MANAGER');
      setEmployees(staff);

      setLastRefresh(Date.now());
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleMarkRead = (id: string) => {
    NotificationService.markRead(id);
    loadData();
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      NotificationService.markAllReadForRop(currentUser.id);
      loadData();
    }
  };

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout user={currentUser}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            {t('dashboard')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Asia/Tashkent • {new Date(lastRefresh).toLocaleTimeString('uz-UZ', {timeZone: 'Asia/Tashkent'})}
          </p>
        </div>
        
        <div className="flex gap-2">
           <Button variant="ghost" onClick={loadData} className="text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
             {t('notif_refresh')}
           </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">{t('staff')}</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Active Employees</p>
        </Card>
        <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">System Alerts</h3>
          <div className="flex items-baseline gap-2 mt-2">
             <p className="text-3xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
             <span className="text-sm text-gray-500">unread</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Notifications requiring attention</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Notification Center Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
              {t('notif_center_title')}
              {unreadCount > 0 && <Badge variant="info">{unreadCount}</Badge>}
            </h3>
            {unreadCount > 0 && (
               <button 
                 onClick={handleMarkAllRead}
                 className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
               >
                 {t('notif_mark_all_read')}
               </button>
            )}
          </div>
          <Card padding="sm" className="bg-gray-50/50 dark:bg-gray-900/20 border-none shadow-none min-h-[400px]">
             <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
          </Card>
        </div>

        {/* Staff List Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('staff')}</h3>
          <Card padding="none" className="overflow-hidden bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">{t('table_name')}</th>
                    <th className="px-6 py-3 font-semibold">{t('table_phone')}</th>
                    <th className="px-6 py-3 font-semibold">{t('table_role')}</th>
                    <th className="px-6 py-3 font-semibold">{t('table_device')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                  {employees.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                       <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                       <td className="px-6 py-4 font-mono text-xs">{u.phone}</td>
                       <td className="px-6 py-4"><Badge variant="neutral">{u.role}</Badge></td>
                       <td className="px-6 py-4">
                         {u.boundDeviceId ? <Badge variant="success">Online</Badge> : <Badge variant="neutral">-</Badge>}
                       </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};
