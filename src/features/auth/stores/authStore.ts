import { create } from 'zustand';

export type BadgeStatus = 'visitor' | 'loyal' | 'king';

export interface User {
  user_id:      string;
  nickname:     string;
  email:        string;
  badge_status: BadgeStatus;
}

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           localStorage.getItem('kk_token'),
  isAuthenticated: !!localStorage.getItem('kk_token'),

  setAuth: (user, token) => {
    localStorage.setItem('kk_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('kk_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));