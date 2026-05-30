import { api } from './api';
import Cookies from 'js-cookie';

const CANDIDATE_TOKEN_KEY = 'candidate_token';

export const candidateAuthService = {
  async register(data: any) {
    const response = await api.post('/candidate-auth/register', data);
    return response.data;
  },

  async login(data: any) {
    const response = await api.post('/candidate-auth/login', data);
    if (response.data.access_token) {
      Cookies.set(CANDIDATE_TOKEN_KEY, response.data.access_token, { expires: 8 });
      // Set the token in api instance for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  async getMe() {
    const token = Cookies.get(CANDIDATE_TOKEN_KEY);
    if (!token) throw new Error('No candidate token found');
    
    // Set token just in case it's not set
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/candidate-auth/me');
    return response.data;
  },

  logout() {
    Cookies.remove(CANDIDATE_TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  getToken() {
    return Cookies.get(CANDIDATE_TOKEN_KEY);
  }
};
