import apiClient from './client';
import { ApiResponse, AuthResponse } from '@/types';

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function getMe(): Promise<ApiResponse<AuthResponse['user']>> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
