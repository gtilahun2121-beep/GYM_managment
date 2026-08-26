import { create } from 'zustand';
import { User, UserRole } from '@gym/shared-types';
import { api } from '../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, gymId: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    gymId?: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email: string, password: string, gymId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        gymId
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      set({
        accessToken: response.data.accessToken,
        isAuthenticated: true
      });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    gymId?: string
  ) => {
    set({ isLoading: true });
    try {
      const payload: any = {
        email,
        password,
        firstName,
        lastName
      };
      
      if (gymId) {
        payload.gymId = gymId;
      }
      
      await api.post('/auth/register', payload);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({
        accessToken: token,
        isAuthenticated: true
      });
    }
  }
}));
