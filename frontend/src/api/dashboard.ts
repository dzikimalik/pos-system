import apiClient from './client';
import { ApiResponse, DashboardStats, Product, Transaction } from '@/types';

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
}

export async function getBestSellingProducts(): Promise<ApiResponse<Product[]>> {
  const response = await apiClient.get('/dashboard/best-selling');
  return response.data;
}

export async function getRecentTransactions(): Promise<ApiResponse<Transaction[]>> {
  const response = await apiClient.get('/dashboard/recent-transactions');
  return response.data;
}
