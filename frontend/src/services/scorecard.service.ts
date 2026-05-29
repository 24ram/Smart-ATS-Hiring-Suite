import { api } from './api';

export interface Scorecard {
  id: string;
  interview_id: string;
  candidate_id: string;
  evaluator_name: string;
  ratings: Record<string, number>;
  overall_score: number;
  feedback_text: string;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  created_at: string;
}

export interface ScorecardCreate {
  interview_id: string;
  candidate_id: string;
  evaluator_name: string;
  ratings: Record<string, number>;
  overall_score: number;
  feedback_text: string;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
}

export const scorecardService = {
  async submitScorecard(data: ScorecardCreate): Promise<Scorecard> {
    const response = await api.post('/scorecards/', data);
    return response.data;
  },

  async getCandidateScorecards(candidateId: string): Promise<Scorecard[]> {
    const response = await api.get(`/scorecards/candidate/${candidateId}`);
    return response.data;
  }
};
