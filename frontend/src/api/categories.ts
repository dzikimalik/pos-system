import apiClient from './client';
import { ApiResponse, Category, PaginatedResponse } from '@/types';

export async function getCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Category[]>> {
  const response = await apiClient.get('/categories', { params });
  return response.data;
}

export async function getCategory(id: number): Promise<ApiResponse<Category>> {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
}

export async function createCategory(
  data: Omit<Category, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Category>> {
  const response = await apiClient.post('/categories', data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Category>> {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
}
