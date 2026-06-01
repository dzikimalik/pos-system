import apiClient from './client';
import { ApiResponse, SalesReport } from '@/types';

export async function getDailySales(date: string): Promise<ApiResponse<SalesReport[]>> {
  const response = await apiClient.get('/reports/daily', { params: { date } });
  return response.data;
}

export async function getWeeklySales(
  startDate: string,
  endDate: string
): Promise<ApiResponse<SalesReport[]>> {
  const response = await apiClient.get('/reports/weekly', {
    params: { startDate, endDate },
  });
  return response.data;
}

export async function getMonthlySales(
  year: number,
  month: number
): Promise<ApiResponse<SalesReport[]>> {
  const response = await apiClient.get('/reports/monthly', {
    params: { year, month },
  });
  return response.data;
}

export async function getProductSales(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<SalesReport[]>> {
  const response = await apiClient.get('/reports/products', { params });
  return response.data;
}

export async function exportCSV(
  type: string,
  params?: Record<string, string | number>
): Promise<Blob> {
  const response = await apiClient.get('/reports/export/csv', {
    params: { type, ...params },
    responseType: 'blob',
  });
  return response.data;
}

export async function exportExcel(
  type: string,
  params?: Record<string, string | number>
): Promise<Blob> {
  const response = await apiClient.get('/reports/export/excel', {
    params: { type, ...params },
    responseType: 'blob',
  });
  return response.data;
}
