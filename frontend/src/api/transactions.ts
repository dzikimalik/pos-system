import apiClient from './client';
import { ApiResponse, PaginatedResponse, Transaction } from '@/types';

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Transaction[]>> {
  const response = await apiClient.get('/transactions', { params });
  return response.data;
}

export async function getTransaction(id: string): Promise<ApiResponse<Transaction>> {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
}

export async function createTransaction(data: {
  items: { productId: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashAmount: number;
  changeAmount: number;
  customerId?: string;
}): Promise<ApiResponse<Transaction>> {
  const response = await apiClient.post('/cashier/transaction', data);
  return response.data;
}

export async function refundTransaction(id: string): Promise<ApiResponse<Transaction>> {
  const response = await apiClient.post(`/transactions/${id}/refund`);
  return response.data;
}
