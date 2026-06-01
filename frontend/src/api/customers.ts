import apiClient from './client';
import { ApiResponse, Customer, PaginatedResponse } from '@/types';

export async function getCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Customer[]>> {
  const response = await apiClient.get('/customers', { params });
  return response.data;
}

export async function getCustomer(id: number): Promise<ApiResponse<Customer>> {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(
  data: Omit<Customer, 'id' | 'isActive'>
): Promise<ApiResponse<Customer>> {
  const response = await apiClient.post('/customers', data);
  return response.data;
}

export async function updateCustomer(
  id: number,
  data: Partial<Omit<Customer, 'id'>>
): Promise<ApiResponse<Customer>> {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id: number): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
}

export async function searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
  const response = await apiClient.get('/customers/search', { params: { q: query } });
  return response.data;
}
