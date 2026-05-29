import { api } from './api';

export interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  interviewer_name: string;
  scheduled_at: string;
  meeting_link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface InterviewCreate {
  candidate_id: string;
  job_id: string;
  interviewer_name: string;
  scheduled_at: string;
  meeting_link: string;
}

export const interviewService = {
  async createInterview(data: InterviewCreate): Promise<Interview> {
    const response = await api.post('/interviews/', data);
    return response.data;
  },

  async getInterviews(candidateId?: string): Promise<Interview[]> {
    const params = candidateId ? { candidate_id: candidateId } : {};
    const response = await api.get('/interviews/', { params });
    return response.data;
  },

  async updateStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<Interview> {
    const response = await api.patch(`/interviews/${id}/status`, { status });
    return response.data;
  }
};
