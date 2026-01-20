
import { ConfigService } from './ConfigService';

const TEST_GPS_KEY = "hr.testgps.v1";

// Default start point (Tashkent) if no test location is set
const DEFAULT_TEST_LOC = { lat: 41.2995, lng: 69.2401 };

export interface GeoLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  source: "REAL" | "TEST";
  timestamp: number;
}

export interface GeoError {
  code: string;
  message: string; // Internal message
  userMessage: string; // Uzbek friendly message
}

export const GeoService = {
  
  // --- A. Environment Checks ---

  isSecureContextSafe: (): { ok: boolean; reason?: string } => {
    // Localhost is considered secure
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return { ok: true };
    }
    // Otherwise require HTTPS
    if (window.isSecureContext === false) {
      return { ok: false, reason: "HTTPS talab qilinadi. Sayt himoyalanmagan (insecure context)." };
    }
    return { ok: true };
  },

  checkPermission: async (): Promise<PermissionState | 'unknown'> => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
      } catch (e) {
        return 'unknown';
      }
    }
    return 'unknown';
  },

  // --- B. Test Mode Logic ---

  getTestLocation: (): { lat: number; lng: number } => {
    try {
      const raw = localStorage.getItem(TEST_GPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse test GPS", e);
    }
    return DEFAULT_TEST_LOC;
  },

  setTestLocation: (lat: number, lng: number) => {
    localStorage.setItem(TEST_GPS_KEY, JSON.stringify({ lat, lng }));
  },

  // --- C. Real & Watch Logic ---

  /**
   * Unified method to get location ONCE.
   */
  getLocation: async (): Promise<GeoLocationResult> => {
    // 1. TEST MODE
    if (ConfigService.GPS_TEST_MODE) {
      const loc = GeoService.getTestLocation();
      return {
        lat: loc.lat,
        lng: loc.lng,
        accuracy: 10, 
        source: "TEST",
        timestamp: Date.now()
      };
    }

    // 2. REAL MODE - Check Environment
    const secureCheck = GeoService.isSecureContextSafe();
    if (!secureCheck.ok) {
      throw { code: "INSECURE_CONTEXT", userMessage: secureCheck.reason } as GeoError;
    }

    if (!navigator.geolocation) {
      throw { code: "NOT_SUPPORTED", userMessage: "Brauzerda GPS qo'llab-quvvatlanmaydi." } as GeoError;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            source: "REAL",
            timestamp: pos.timestamp
          });
        },
        (err) => {
          reject(GeoService.mapError(err));
        },
        { 
          enableHighAccuracy: ConfigService.GPS_HIGH_ACCURACY, 
          timeout: ConfigService.GPS_TIMEOUT_MS, 
          maximumAge: ConfigService.GPS_MAX_AGE_MS 
        }
      );
    });
  },

  /**
   * Unified method to WATCH location continuously.
   * Returns a function to STOP watching (cleanup).
   */
  watchLocation: (
    onUpdate: (loc: GeoLocationResult) => void,
    onError: (err: GeoError) => void
  ): (() => void) => {
    
    // 1. TEST MODE: Use Interval
    if (ConfigService.GPS_TEST_MODE) {
      console.log("GPS: Starting WATCH (TEST MODE)");
      // Immediate first call
      const loc = GeoService.getTestLocation();
      onUpdate({ lat: loc.lat, lng: loc.lng, accuracy: 10, source: "TEST", timestamp: Date.now() });
      
      const intervalId = window.setInterval(() => {
        const current = GeoService.getTestLocation();
        onUpdate({ 
          lat: current.lat, 
          lng: current.lng, 
          accuracy: 10, 
          source: "TEST", 
          timestamp: Date.now() 
        });
      }, 2000); // 2 second poll in test mode

      return () => clearInterval(intervalId);
    }

    // 2. REAL MODE
    console.log("GPS: Starting WATCH (REAL MODE)");
    const secureCheck = GeoService.isSecureContextSafe();
    if (!secureCheck.ok) {
      onError({ code: "INSECURE_CONTEXT", message: "Insecure Context", userMessage: secureCheck.reason || "Error" });
      return () => {};
    }

    if (!navigator.geolocation) {
      onError({ code: "NOT_SUPPORTED", message: "Not Supported", userMessage: "GPS qo'llab-quvvatlanmaydi." });
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onUpdate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: "REAL",
          timestamp: pos.timestamp
        });
      },
      (err) => {
        onError(GeoService.mapError(err));
      },
      { 
        enableHighAccuracy: ConfigService.GPS_HIGH_ACCURACY, 
        timeout: ConfigService.GPS_TIMEOUT_MS, 
        maximumAge: ConfigService.GPS_MAX_AGE_MS 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  },

  // --- Helper: Error Mapping ---
  mapError: (err: GeolocationPositionError): GeoError => {
    let code = "UNKNOWN";
    let userMsg = "GPS xatolik yuz berdi.";

    switch (err.code) {
      case err.PERMISSION_DENIED:
        code = "PERMISSION_DENIED";
        userMsg = "Joylashuvga ruxsat berilmagan. Sozlamalardan yoqing.";
        break;
      case err.POSITION_UNAVAILABLE:
        code = "POSITION_UNAVAILABLE";
        userMsg = "GPS signali topilmadi. Ochiq joyga chiqing.";
        break;
      case err.TIMEOUT:
        code = "TIMEOUT";
        userMsg = "GPS javob bermadi (Timeout). Qayta urining.";
        break;
    }
    
    console.warn(`GeoService Error: ${code} - ${err.message}`);
    return { code, message: err.message, userMessage: userMsg };
  }
};
