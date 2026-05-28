import { api } from './api';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string[];
  salary_range?: string;
  status: string;
  created_by: string;
  created_at: string;
}

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const response = await api.get('/jobs/');
    return response.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async createJob(data: Partial<Job>): Promise<Job> {
    const response = await api.post('/jobs/', data);
    return response.data;
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }
};
