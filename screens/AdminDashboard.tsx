
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { LocationService, LocationResult } from '../services/LocationService';
import { GeoService } from '../services/GeoService'; 
import { User, UserRole, LocationConfig } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { LocationMap } from '../components/LocationMap';
import { GeoDebugPanel } from '../components/GeoDebugPanel'; 

export const AdminDashboard: React.FC = () => {
  const currentUser = AuthService.getCurrentUser();
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '', role: 'EMPLOYEE' as UserRole });
  
  const [locConfig, setLocConfig] = useState<LocationConfig>(LocationService.getLocationConfig());

  const [geoDebug, setGeoDebug] = useState<{
    info: Partial<LocationResult>;
    error: string | null;
    permission: string;
    loading: boolean;
  }>({
    info: {},
    error: null,
    permission: 'unknown',
    loading: false
  });

  useEffect(() => { 
    setUsers(UserService.getAllUsers());
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const perm = await GeoService.checkPermission();
    setGeoDebug(prev => ({ ...prev, permission: perm }));
  };

  const handleResetDevice = (userId: string) => {
    if (window.confirm(t('confirm_reset'))) {
      const user = UserService.getUserById(userId);
      if (user) {
        user.boundDeviceId = null;
        UserService.saveUser(user);
        setUsers(UserService.getAllUsers());
        alert(t('device_binding_reset'));
      }
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      UserService.createUser(newUser.name, newUser.phone, newUser.role);
      setUsers(UserService.getAllUsers());
      setIsModalOpen(false);
      setNewUser({ name: '', phone: '', role: 'EMPLOYEE' });
      alert(t('user_created'));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    LocationService.saveLocationConfig(locConfig);
    alert(t('location_saved'));
  };

  const handleGetCurrentLocation = async () => {
    setGeoDebug(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pos = await LocationService.getCurrentLocation();
      setGeoDebug(prev => ({
        ...prev,
        loading: false,
        error: null,
        info: pos
      }));

    } catch (e: any) {
      const msgKey = e.userMessage || e.message || 'error_unknown';
      setGeoDebug(prev => ({ ...prev, loading: false, error: msgKey }));
      checkPermission();
    }
  };

  const assignCurrentToWorkplace = () => {
    if (geoDebug.info.lat && geoDebug.info.lng) {
      setLocConfig({
        ...locConfig,
        latitude: geoDebug.info.lat,
        longitude: geoDebug.info.lng
      });
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setLocConfig({
      ...locConfig,
      latitude: lat,
      longitude: lng
    });
  };

  if (!currentUser) return null;

  return (
    <DashboardLayout user={currentUser}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboard')}</h2>
        <Button onClick={() => setIsModalOpen(true)}>{t('add_user')}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('staff')}</h3>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{users.length}</p>
        </Card>

        <Card className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white">{t('location_settings')}</h3>
              <Button size="sm" variant="secondary" onClick={handleGetCurrentLocation} disabled={geoDebug.loading}>
                {geoDebug.loading ? t('loading') : `📍 ${t('get_current_location')}`}
              </Button>
           </div>
           
           {geoDebug.info.lat && (
             <div className="flex flex-wrap gap-2 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
               <span className="text-xs font-mono text-gray-500 w-full mb-1">
                 Current: {geoDebug.info.lat.toFixed(6)}, {geoDebug.info.lng?.toFixed(6)} ({geoDebug.info.source})
               </span>
               <Button size="sm" onClick={assignCurrentToWorkplace} variant="primary">
                 {t('set_as_workplace')}
               </Button>
             </div>
           )}
           
           <div className="mb-6">
             <LocationMap 
               workplace={{ lat: locConfig.latitude, lng: locConfig.longitude, radius: locConfig.radius }}
               interactive={true}
               onWorkplaceChange={handleMapSelect}
             />
             <p className="text-center text-xs text-gray-400 mt-2 italic">{t('set_from_map')}</p>
             
             <GeoDebugPanel 
                info={geoDebug.info} 
                error={geoDebug.error} 
                permission={geoDebug.permission}
                loading={geoDebug.loading}
                onRefresh={handleGetCurrentLocation}
             />
           </div>

           <form onSubmit={handleSaveLocation} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label={t('latitude')} 
                  type="number" step="any"
                  value={locConfig.latitude}
                  onChange={e => setLocConfig({...locConfig, latitude: parseFloat(e.target.value)})}
                />
                <Input 
                  label={t('longitude')} 
                  type="number" step="any"
                  value={locConfig.longitude}
                  onChange={e => setLocConfig({...locConfig, longitude: parseFloat(e.target.value)})}
                />
                <Input 
                  label={t('radius')} 
                  type="number"
                  value={locConfig.radius}
                  onChange={e => setLocConfig({...locConfig, radius: parseFloat(e.target.value)})}
                />
             </div>

             <div className="flex justify-end">
                <Button type="submit">{t('save_location')}</Button>
             </div>
           </form>
           
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white">{t('system_users_title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-semibold">{t('table_name')}</th>
                <th className="px-6 py-3 font-semibold">{t('table_phone')}</th>
                <th className="px-6 py-3 font-semibold">{t('table_role')}</th>
                <th className="px-6 py-3 font-semibold">{t('table_device')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('table_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4">{u.phone}</td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{t(`role_${u.role.toLowerCase()}` as any)}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {u.boundDeviceId ? (
                      <Badge variant="success">{t('status_bound')}</Badge>
                    ) : (
                      <Badge variant="neutral" className="opacity-50">{t('status_unbound')}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.boundDeviceId && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleResetDevice(u.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t('reset_device')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('add_user')}</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input 
                label={t('table_name')} 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
                required 
              />
              <Input 
                label={t('table_phone')} 
                value={newUser.phone} 
                onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                required 
                placeholder="99890..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('select_role')}
                </label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ROP">ROP</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('create')}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
