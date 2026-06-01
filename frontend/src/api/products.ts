import apiClient from './client';
import { ApiResponse, PaginatedResponse, Product } from '@/types';

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}): Promise<PaginatedResponse<Product[]>> {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function getProduct(id: number): Promise<ApiResponse<Product>> {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(
  data: Omit<Product, 'id' | 'category' | 'isActive'>
): Promise<ApiResponse<Product>> {
  const response = await apiClient.post('/products', data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<Product, 'id' | 'category'>>
): Promise<ApiResponse<Product>> {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
}

export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  const response = await apiClient.get('/products/search', { params: { q: query } });
  return response.data;
}

export async function getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
  const response = await apiClient.get(`/products/barcode/${barcode}`);
  return response.data;
}
