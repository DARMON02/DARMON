import React, { useEffect, PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { AdminDashboard } from './screens/AdminDashboard';
import { RopDashboard } from './screens/RopDashboard';
import { EmployeeDashboard } from './screens/EmployeeDashboard';
import { AuthService } from './services/AuthService';
import { UserRole } from './types';
import { ThemeService } from './services/ThemeService';
import { useI18n } from './i18n/useI18n';

// Fallback component
const NotFound = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 font-mono">
      <div className="text-center">
        <h1 className="text-2xl mb-2">{t('not_found_title')}</h1>
        <p>{t('not_found_path')}: {window.location.hash}</p>
        <a href="#/login" className="text-blue-400 mt-4 block">{t('go_login')}</a>
      </div>
    </div>
  );
};

const AccessDenied = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{t('access_denied_title')}</h1>
        <p>{t('access_denied_desc')}</p>
        <a href="#/login" className="text-blue-600 mt-4 block">{t('back_login')}</a>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: PropsWithChildren<ProtectedRouteProps>) => {
  const user = AuthService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    // Init global services
    AuthService.init();
    ThemeService.init();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* ROP */}
        <Route path="/rop" element={
          <ProtectedRoute allowedRoles={['ROP']}>
            <RopDashboard />
          </ProtectedRoute>
        } />

        {/* EMPLOYEE & LEGACY SALES_MANAGER */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['EMPLOYEE', 'SALES_MANAGER']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        {/* Legacy redirect */}
        <Route path="/sales-manager" element={<Navigate to="/employee" replace />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

export default App;