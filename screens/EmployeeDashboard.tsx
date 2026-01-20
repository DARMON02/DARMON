import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AuthService } from '../services/AuthService';
import { useI18n } from '../i18n/useI18n';
import { SalesManagerScreen } from './SalesManagerScreen';
import { Card } from '../components/ui/Card';

export const EmployeeDashboard: React.FC = () => {
  const currentUser = AuthService.getCurrentUser();
  const { t } = useI18n();

  if (!currentUser) return null;

  return (
    <DashboardLayout user={currentUser}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('welcome')}, {currentUser.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('daily_overview')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Attendance - Takes up 2 cols on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
               <h3 className="font-bold text-gray-900 dark:text-white">{t('attendance')}</h3>
            </div>
            <SalesManagerScreen />
          </Card>
        </div>

        {/* Right Col: Stats/Placeholders */}
        <div className="space-y-6">
           <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none">
              <h3 className="font-semibold text-primary-100 mb-1">{t('salary')}</h3>
              <p className="text-3xl font-bold">1 250 000 {t('currency')}</p>
              <p className="text-xs text-primary-200 mt-2">{t('current_month_forecast')}</p>
           </Card>

           <Card>
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('quick_stats')}</h3>
             <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 dark:text-gray-400">{t('days_worked')}</span>
                 <span className="font-medium text-gray-900 dark:text-white">12 {t('unit_days')}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 dark:text-gray-400">{t('avg_hours')}</span>
                 <span className="font-medium text-gray-900 dark:text-white">7.5 {t('unit_hours')}</span>
               </div>
             </div>
           </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};