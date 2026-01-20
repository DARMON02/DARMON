
import { LocationConfig } from '../types';
import { GeoService, GeoLocationResult } from './GeoService';

export type LocationResult = GeoLocationResult;

const LOCATION_KEY = "app:location_config";

// Default to a central point in Tashkent
const DEFAULT_LOCATION: LocationConfig = {
  latitude: 41.2995,
  longitude: 69.2401,
  radius: 100, // 100 meters
};

export const LocationService = {
  getLocationConfig: (): LocationConfig => {
    try {
      const raw = localStorage.getItem(LOCATION_KEY);
      if (!raw) return DEFAULT_LOCATION;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_LOCATION;
    }
  },

  saveLocationConfig: (config: LocationConfig) => {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(config));
  },

  // Set Test Location via GeoService (Wrapper for compatibility)
  setTestLocation: (lat: number, lng: number) => {
    GeoService.setTestLocation(lat, lng);
  },

  getCurrentLocation: async (): Promise<GeoLocationResult> => {
    // Delegate to GeoService which handles permissions, test mode, errors
    return await GeoService.getLocation();
  },

  // Legacy wrapper for simple Position object
  getCurrentPosition: async (): Promise<GeolocationPosition> => {
    const loc = await LocationService.getCurrentLocation();
    return {
      coords: {
        latitude: loc.lat,
        longitude: loc.lng,
        accuracy: loc.accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: loc.timestamp
    } as GeolocationPosition;
  },

  // Haversine formula
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  isInsideWorkplace: async (): Promise<{ inside: boolean; distance: number }> => {
    try {
      const location = await LocationService.getCurrentLocation();
      const config = LocationService.getLocationConfig();
      
      const distance = LocationService.calculateDistance(
        location.lat,
        location.lng,
        config.latitude,
        config.longitude
      );

      return {
        inside: distance <= config.radius,
        distance
      };
    } catch (e) {
      console.error("Location check failed", e);
      throw e;
    }
  }
};
