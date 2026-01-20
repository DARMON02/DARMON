
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useI18n } from '../i18n/useI18n';

// --- Fix for default marker icons in Leaflet ---
// In a real bundler env (Vite/Webpack), importing images from leaflet might be tricky without config.
// Using CDN images is a robust fallback for this "no-config" constraint.
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A different icon for the employee to distinguish from workplace
const EmployeeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  workplace: { lat: number; lng: number; radius: number };
  employee?: { lat: number; lng: number };
  onWorkplaceChange?: (lat: number, lng: number) => void;
  interactive: boolean; // If true, allows clicking map to set workplace
}

// Helper to handle click events
const ClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Helper to center map when props change
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const LocationMap: React.FC<Props> = ({ workplace, employee, onWorkplaceChange, interactive }) => {
  const { t } = useI18n();

  // Center logic: If employee exists, maybe center between them? Or just center workplace.
  // Simple rule: Center workplace.
  const center: [number, number] = [workplace.lat, workplace.lng];

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-inner relative z-0">
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive} // Disable scroll zoom on employee view to avoid page scroll blocking
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update View Logic */}
        <MapUpdater center={center} />

        {/* Click Handler (Admin Only) */}
        {interactive && onWorkplaceChange && (
          <ClickHandler onLocationSelect={onWorkplaceChange} />
        )}

        {/* Workplace Marker & Circle */}
        <Marker position={[workplace.lat, workplace.lng]}>
          <Popup>{t('workplace_marker')}</Popup>
        </Marker>
        <Circle 
          center={[workplace.lat, workplace.lng]} 
          radius={workplace.radius}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
        />

        {/* Employee Marker */}
        {employee && (
          <Marker position={[employee.lat, employee.lng]} icon={EmployeeIcon}>
            <Popup>{t('my_location_marker')}</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-gray-800/90 p-2 rounded shadow text-xs">
        <h4 className="font-bold mb-1 text-gray-800 dark:text-gray-200">{t('map_legend')}</h4>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 opacity-50 border border-blue-600"></span>
          <span className="text-gray-600 dark:text-gray-300">{t('workplace_marker')} ({workplace.radius}m)</span>
        </div>
        {employee && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700"></span>
            <span className="text-gray-600 dark:text-gray-300">{t('my_location_marker')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
