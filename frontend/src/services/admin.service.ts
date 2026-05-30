import { api } from './api';

export interface AdminStats {
  total_recruiters: number;
  total_hiring_managers: number;
  total_candidates: number;
  total_jobs: number;
  total_applications: number;
  total_interviews: number;
  total_offers: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  updateUserStatus: async (userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<User> => {
    const res = await api.put(`/admin/users/${userId}/status`, { status });
    return res.data;
  }
};
