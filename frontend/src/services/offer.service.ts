import { api } from './api';

export interface Offer {
  id: string;
  candidate_id: string;
  candidate_name: string;
  job_id: string;
  job_title: string;
  salary: string;
  joining_date: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  offer_letter_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  viewed_at?: string;
  responded_at?: string;
}

export interface OfferCreate {
  candidate_id: string;
  job_id: string;
  salary: string;
  joining_date: string;
}

export interface OfferUpdate {
  salary?: string;
  joining_date?: string;
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
}

export const offerService = {
  async getOffers(): Promise<Offer[]> {
    const response = await api.get('/offers/');
    return response.data;
  },

  async getOffer(id: string): Promise<Offer> {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  async createOffer(data: OfferCreate): Promise<Offer> {
    const response = await api.post('/offers/', data);
    return response.data;
  },

  async updateOffer(id: string, data: OfferUpdate): Promise<Offer> {
    const response = await api.put(`/offers/${id}`, data);
    return response.data;
  },

  async deleteOffer(id: string): Promise<void> {
    await api.delete(`/offers/${id}`);
  }
};
