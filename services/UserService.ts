
import { User, UserRole } from '../types';

const USERS_KEY = "auth:users";

const DEFAULT_USERS: User[] = [
  { id: "u_admin", phone: "998900000001", name: "System Admin", role: "ADMIN", payType: "HOURLY" },
  { id: "u_rop", phone: "998900000002", name: "ROP Manager", role: "ROP", payType: "HOURLY" },
  { id: "u_emp", phone: "998900000003", name: "Test Employee", role: "EMPLOYEE", payType: "HOURLY", managerRopId: "u_rop" },
];

export const UserService = {
  init: () => {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  },

  getAllUsers: (): User[] => {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  getUserByPhone: (phone: string): User | undefined => {
    const users = UserService.getAllUsers();
    return users.find(u => u.phone === phone);
  },

  getUserById: (id: string): User | undefined => {
    const users = UserService.getAllUsers();
    return users.find(u => u.id === id);
  },

  saveUser: (user: User) => {
    const users = UserService.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  createUser: (name: string, phone: string, role: UserRole): User => {
    const users = UserService.getAllUsers();
    if (users.find(u => u.phone === phone)) {
      throw new Error("Phone already exists");
    }

    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      phone,
      role,
      payType: 'HOURLY', // Default
      hourlyRate: 0,
      dailyRate: 0,
      boundDeviceId: null
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  deleteUser: (userId: string) => {
    let users = UserService.getAllUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
