
import { User, UserRole } from '../types';
import { UserService } from './UserService';

const SESSION_KEY = "auth:session";
const DEVICE_ID_KEY = "auth:device_id";

// Helper to get or create device ID
const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const AuthService = {
  init: () => {
    UserService.init();
    getDeviceId();
  },

  login: (phone: string, otp: string): User => {
    const MASTER_OTP = "200622";
    const NORMAL_OTP = "123456";

    // 1. Find User
    const user = UserService.getUserByPhone(phone);
    if (!user) {
      throw new Error("error_user_not_found");
    }

    // 2. Validate OTP
    if (otp !== NORMAL_OTP && otp !== MASTER_OTP) {
      throw new Error("error_invalid_otp");
    }

    // 3. Device Security Check
    const currentDeviceId = getDeviceId();
    let updatedUser = { ...user };
    let mustSave = false;

    if (otp === MASTER_OTP) {
      // Master OTP: Always bind to current device (Override)
      if (user.boundDeviceId !== currentDeviceId) {
        updatedUser.boundDeviceId = currentDeviceId;
        mustSave = true;
      }
    } else {
      // Normal OTP: Strict Check
      if (user.boundDeviceId) {
        if (user.boundDeviceId !== currentDeviceId) {
          throw new Error("error_device_mismatch");
        }
      } else {
        // First time login: Bind device
        updatedUser.boundDeviceId = currentDeviceId;
        mustSave = true;
      }
    }

    // 4. Save updates if binding changed
    if (mustSave) {
      UserService.saveUser(updatedUser);
    }

    // 5. Create Session
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getDeviceId: getDeviceId
};
