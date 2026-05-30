import { api } from './api';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_letter?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: 'applied' | 'screening' | 'interview' | 'technical' | 'hr' | 'offer' | 'offered' | 'hired' | 'rejected';
  ai_score?: number;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  hm_feedback?: string;
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

  async getApplications(jobId?: string, candidateId?: string): Promise<Application[]> {
    const params: any = {};
    if (jobId) params.job_id = jobId;
    if (candidateId) params.candidate_id = candidateId;
    const response = await api.get('/applications/', { params });
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Application> {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  async submitFeedback(id: string, feedback: string): Promise<Application> {
    const response = await api.put(`/applications/${id}/feedback`, { feedback });
    return response.data;
  }
};
