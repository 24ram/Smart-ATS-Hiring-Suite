import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export const authService = {
  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: any) {
    const response = await api.post('/auth/login/json', data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  initToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }
};
