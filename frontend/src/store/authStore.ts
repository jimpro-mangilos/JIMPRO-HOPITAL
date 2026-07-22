import { create } from 'zustand';

interface StaffInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  speciality?: string;
  department?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  staff?: StaffInfo;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user: User, token: string) => {
    localStorage.setItem('jimpro-token', token);
    localStorage.setItem('jimpro-user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('jimpro-token');
    localStorage.removeItem('jimpro-user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = localStorage.getItem('jimpro-token');
    const userStr = localStorage.getItem('jimpro-user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('jimpro-token');
        localStorage.removeItem('jimpro-user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
