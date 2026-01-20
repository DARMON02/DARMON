
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AuthService } from '../services/AuthService';
import { useI18n } from '../i18n/useI18n';
import { Card } from '../components/ui/Card';

export const HrDashboard: React.FC = () => {
  const currentUser = AuthService.getCurrentUser();
  const { t } = useI18n();
  if (!currentUser) return null;

  return (
    <DashboardLayout user={currentUser}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('dashboard')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">{t('attendance')}</h3>
          <p className="text-gray-400 mt-2 text-sm">{t('placeholder_attendance_table')}</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">{t('staff')}</h3>
          <p className="text-gray-400 mt-2 text-sm">{t('placeholder_employee_mgmt')}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};
