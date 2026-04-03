/***
Path:/kingskolossium/src/api/client.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Axios instance, API_BASE_URL env var
***/

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;