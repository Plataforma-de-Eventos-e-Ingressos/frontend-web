import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EliteTickets:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});