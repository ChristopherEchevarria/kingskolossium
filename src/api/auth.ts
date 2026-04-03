import { apiClient } from './client';

export interface RegisterPayload { nickname: string; email: string; password: string; }
export interface LoginPayload    { email: string; password: string; }
export interface TokenResponse   { access_token: string; token_type: string; }
export interface UserResponse    { user_id: string; nickname: string; email: string; badge_status: string; }

export async function registerUser(data: RegisterPayload): Promise<TokenResponse> {
  const res = await apiClient.post('/api/auth/register', data);
  return res.data;
}

export async function loginUser(data: LoginPayload): Promise<TokenResponse> {
  const res = await apiClient.post('/api/auth/login', data);
  return res.data;
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  const res = await apiClient.get('/api/auth/me');
  return res.data;
}