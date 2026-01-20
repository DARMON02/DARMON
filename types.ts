
export type UserRole = "ADMIN" | "ROP" | "SALES_MANAGER" | "EMPLOYEE" | "HR";
export type PayType = "HOURLY" | "DAILY";
export type SessionStatus = "active" | "paused_manual" | "paused_auto" | "completed";

export type NotificationType = "AUTO_PAUSE" | "AUTO_RESUME" | "AUTO_FINISH" | "MANUAL_PAUSE" | "MANUAL_FINISH" | "OUTSIDE_WARNING";

export interface Notification {
  id: string;
  ts: number;
  type: NotificationType;
  employeeId: string;
  employeeName?: string;
  employeePhone?: string;
  ropId?: string; // If null, broadcast to all ROPs
  
  // Localization
  messageKey: string; 
  messageParams?: Record<string, string | number>;
  
  // Metadata for advanced UI
  meta?: {
    durationMinutes?: number;
    checkInTime?: number;
    checkOutTime?: number;
    pauseType?: "manual" | "auto";
    [key: string]: any;
  };
  
  read?: boolean;
}

export interface User {
  id: string;
  phone: string; // Used as login ID
  name: string;
  role: UserRole;
  payType: PayType;
  hourlyRate?: number; // Main source of salary calculation
  dailyRate?: number; // Deprecated for this step
  boundDeviceId?: string | null; // For device binding
  managerRopId?: string; // The specific ROP responsible for this user
}

export interface WorkSessionPause {
  start: number; // timestamp ms
  end?: number;  // timestamp ms
  type: "manual" | "auto";
}

export interface GeoData {
  lat: number;
  lng: number;
  ts: number;
  distanceM: number;
  inside: boolean;
  source: "REAL" | "TEST";
}

export interface WorkSession {
  id: string;
  userId: string;
  status: SessionStatus;
  checkInTime: number; // timestamp ms
  checkOutTime?: number; // timestamp ms
  pauses: WorkSessionPause[];
  outsideSince?: number; // Timestamp when first detected outside
  lastGeo?: GeoData;     // Last recorded geo status
  meta?: {
    note?: string;
  };
}

export interface SessionStats {
  paidMs: number;
  totalPausedMs: number;
  currentPauseMs: number;
  salaryEarned: number;
}

export interface LocationConfig {
  latitude: number;
  longitude: number;
  radius: number; // meters
  // Test Mode Configuration
  testLatitude?: number;
  testLongitude?: number;
}
