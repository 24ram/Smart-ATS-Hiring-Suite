import { api } from './api';
import Cookies from 'js-cookie';

const getHeaders = () => {
  const token = Cookies.get('candidate_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const candidatePortalService = {
  async getJobs() {
    const response = await api.get('/candidate/jobs', { headers: getHeaders() });
    return response.data;
  },

  async getJobDetails(jobId: string) {
    const response = await api.get(`/candidate/jobs/${jobId}`, { headers: getHeaders() });
    return response.data;
  },

  async applyForJob(jobId: string) {
    const response = await api.post(`/candidate/jobs/${jobId}/apply`, {}, { headers: getHeaders() });
    return response.data;
  },

  async getApplications() {
    const response = await api.get('/candidate/applications', { headers: getHeaders() });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/candidate/profile', { headers: getHeaders() });
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/candidate/profile', data, { headers: getHeaders() });
    return response.data;
  },

  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/candidate/profile/resume', formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getInterviews() {
    const response = await api.get('/candidate/interviews', { headers: getHeaders() });
    return response.data;
  },

  async getOffers() {
    const response = await api.get('/candidate/offers', { headers: getHeaders() });
    return response.data;
  },

  async respondToOffer(offerId: string, response: 'accepted' | 'rejected') {
    const res = await api.put(`/candidate/offers/${offerId}/respond`, { response }, { headers: getHeaders() });
    return res.data;
  }
};
