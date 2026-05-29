import { api } from './api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience?: string;
  resume_url: string;
  ai_score?: number;
  stage?: string;
  notes?: string[];
  created_at: string;
  updated_at?: string;
  matched_jobs?: string[];
}

export interface Activity {
  type: string;
  message: string;
  timestamp: string;
}

export interface AIAnalysis {
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface MatchedJobDetails {
  id: string;
  title: string;
  company: string;
  ai_score?: number;
  status: string;
}

export interface CandidateDetails extends Candidate {
  ai_analysis?: AIAnalysis;
  matched_jobs_details: MatchedJobDetails[];
  activities: Activity[];
}

export const candidateService = {
  async uploadCandidateResume(file: File, name: string, email: string, phone?: string): Promise<Candidate> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);

    const response = await api.post('/candidates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getCandidates(): Promise<Candidate[]> {
    const response = await api.get('/candidates/');
    return response.data;
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  async getCandidateDetails(id: string): Promise<CandidateDetails> {
    const response = await api.get(`/candidates/${id}/details`);
    return response.data;
  },

  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/candidates/${id}`);
  },

  async matchCandidateToJob(jobId: string, candidateId: string): Promise<{ match_score: number }> {
    const response = await api.post(`/candidates/match/${jobId}/${candidateId}`);
    return response.data;
  },

  async updateStage(id: string, stage: string): Promise<Candidate> {
    const response = await api.patch(`/candidates/${id}/stage`, { stage });
    return response.data;
  },

  async addNote(id: string, note: string): Promise<Candidate> {
    const response = await api.post(`/candidates/${id}/notes`, { note });
    return response.data;
  }
};
