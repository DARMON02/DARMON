
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { ThemeService } from '../services/ThemeService';
import { useI18n } from '../i18n/useI18n';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginScreen: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuthService.init();
    ThemeService.init();
    
    const user = AuthService.getCurrentUser();
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'ROP') navigate('/rop');
      else if (user.role === 'HR') navigate('/hr');
      else navigate('/employee');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = AuthService.login(phone, otp);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'ROP') navigate('/rop');
      else if (user.role === 'HR') navigate('/hr');
      else navigate('/employee');
    } catch (err: any) {
      const msg = t(err.message as any);
      setError(msg === err.message ? err.message : msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">CRM System</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('login_title')}</p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-primary-500">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex justify-center space-x-2 pb-4 border-b border-gray-100 dark:border-gray-700">
              {(['uz', 'ru', 'en'] as const).map(lang => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    language === lang 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Input
                label={t('phone_label')}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="998900000000"
              />
              <Input
                label={t('otp_label')}
                type="password"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" className="h-12 text-lg shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all">
              {t('login_btn')}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          {t('demo_instruction')}
        </p>
      </div>
    </div>
  );
};
