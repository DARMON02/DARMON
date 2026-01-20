
import React from 'react';
import { useI18n } from '../i18n/useI18n';
import { ThemeService } from '../services/ThemeService';
import { AuthService } from '../services/AuthService';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Props {
  user: User;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ user, children }) => {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState(ThemeService.getTheme());

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    ThemeService.setTheme(newTheme);
    setTheme(newTheme);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getRoleVariant = (role: string): "info" | "warning" | "success" | "neutral" | "error" => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'ROP': return 'info';
      case 'HR': return 'warning';
      default: return 'success';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left Side: Logo & Role */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-lg sm:text-xl text-primary-600 dark:text-primary-400 leading-none">CRM</span>
                <span className="hidden sm:inline text-[0.65rem] text-gray-500 dark:text-gray-400 uppercase tracking-widest">System</span>
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 sm:mx-2"></div>
              <div className="transform scale-90 sm:scale-100 origin-left">
                <Badge variant={getRoleVariant(user.role)}>
                  {t(`role_${user.role.toLowerCase()}` as any)}
                </Badge>
              </div>
            </div>

            {/* Right Side: Controls */}
            <div className="flex items-center gap-2">
              {/* Language Switcher - VISIBLE ON ALL SCREENS */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['uz', 'ru', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-md font-medium transition-all ${
                      language === lang 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Logout - Icon on mobile, Text on desktop */}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="!px-2 !text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/20"
              >
                <span className="hidden sm:inline">{t('logout')}</span>
                <span className="sm:hidden text-lg">✕</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
