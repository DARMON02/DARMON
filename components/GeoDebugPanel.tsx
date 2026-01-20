
import React from 'react';
import { useI18n } from '../i18n/useI18n';
import { ConfigService } from '../services/ConfigService';

interface Props {
  info: {
    lat?: number;
    lng?: number;
    accuracy?: number;
    timestamp?: number;
    source?: string;
  };
  error?: string | null;
  permission?: string;
  loading?: boolean;
  distance?: number | null;
  onRefresh?: () => void;
}

export const GeoDebugPanel: React.FC<Props> = ({ info, error, permission, loading, distance, onRefresh }) => {
  const { t } = useI18n();

  return (
    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] sm:text-xs font-mono border border-gray-200 dark:border-gray-700 shadow-inner">
      <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
        <span className="font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('geo_debug_title')}</span>
        {onRefresh && (
           <button 
             onClick={onRefresh} 
             disabled={loading}
             className="text-blue-600 hover:underline disabled:opacity-50 px-2"
           >
             {loading ? t('loading') : t('refresh')}
           </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        
        {/* Row 1: Mode & Permission */}
        <div className="flex justify-between">
          <span className="text-gray-400">GPS Mode:</span>
          <span className={`font-bold ${ConfigService.GPS_TEST_MODE ? 'text-orange-500' : 'text-blue-500'}`}>
            {ConfigService.GPS_TEST_MODE ? 'TEST (Fake)' : 'REAL'}
          </span>
        </div>
        <div className="flex justify-between">
           <span className="text-gray-400">Permission:</span>
           <span className={`${permission === 'denied' ? 'text-red-500' : 'text-green-600'}`}>
             {permission || 'unknown'}
           </span>
        </div>

        {/* Row 2: Status & Error */}
        <div className="col-span-2 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
           <span className="text-gray-400">Status:</span>
           {error ? (
              <span className="text-red-600 font-bold truncate ml-2" title={error}>{error}</span>
           ) : (
              <span className="text-green-600">OK</span>
           )}
        </div>

        {/* Row 3: Coords */}
        {info.lat && (
          <div className="col-span-2 flex justify-between">
             <span className="text-gray-400">Position:</span>
             <span className="text-gray-800 dark:text-gray-200">
               {info.lat.toFixed(5)}, {info.lng?.toFixed(5)}
             </span>
          </div>
        )}

        {/* Row 4: Accuracy & Distance */}
        {info.lat && (
          <>
            <div className="flex justify-between">
               <span className="text-gray-400">Accuracy:</span>
               <span className={`${info.accuracy && info.accuracy > 50 ? 'text-orange-500' : 'text-green-600'}`}>
                 {info.accuracy ? `±${Math.round(info.accuracy)}m` : '-'}
               </span>
            </div>
            <div className="flex justify-between">
               <span className="text-gray-400">Dist to Work:</span>
               <span className="font-bold text-gray-800 dark:text-gray-200">
                 {distance !== null && distance !== undefined ? `${distance}m` : '-'}
               </span>
            </div>
          </>
        )}

        {/* Row 5: Time */}
        {info.timestamp && (
           <div className="col-span-2 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
             <span className="text-gray-400">Last Upd:</span>
             <span className="text-gray-600 dark:text-gray-400">
               {new Date(info.timestamp).toLocaleTimeString()}
             </span>
           </div>
        )}
      </div>
      
      {permission === 'denied' && (
        <div className="mt-2 p-1.5 bg-red-100 text-red-700 rounded border border-red-200 text-center">
          {t('error_geo_permission_instruction')}
        </div>
      )}
    </div>
  );
};
