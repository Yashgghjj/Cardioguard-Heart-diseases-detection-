import api from './api';
import { User } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string):Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('cardioguard_token', res.data.access_token);
    localStorage.setItem('cardioguard_user', JSON.stringify(res.data.user));
    return res.data;
  },

  register: async (userData: { email: string; password: string; full_name: string; role?: string }): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/register', userData);
    localStorage.setItem('cardioguard_token', res.data.access_token);
    localStorage.setItem('cardioguard_user', JSON.stringify(res.data.user));
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    localStorage.setItem('cardioguard_user', JSON.stringify(res.data));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('cardioguard_token');
    localStorage.removeItem('cardioguard_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('cardioguard_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { email: string; token: string; new_password: string }) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  }
};

