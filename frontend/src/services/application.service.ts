import { api } from './api';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_letter?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  ai_score?: number;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  created_at: string;
  updated_at?: string;
}

export const applicationService = {
  async submitApplication(formData: FormData): Promise<Application> {
    const response = await api.post('/applications/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getApplications(jobId?: string): Promise<Application[]> {
    const params = jobId ? { job_id: jobId } : {};
    const response = await api.get('/applications/', { params });
    return response.data;
  },

  async updateStatus(id: string, status: 'pending' | 'reviewed' | 'rejected'): Promise<Application> {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  }
};
