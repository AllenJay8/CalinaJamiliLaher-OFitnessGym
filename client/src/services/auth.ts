import api from './api';
import type { User } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
};
