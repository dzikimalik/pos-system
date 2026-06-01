export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  barcode: string;
  categoryId: string;
  category?: Category;
  image?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashAmount: number;
  changeAmount: number;
  status: string;
  customer?: Customer;
  user?: User;
  items: TransactionItem[];
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: Pagination;
}

export interface DashboardStats {
  totalProducts: number;
  totalTransactions: number;
  revenueToday: number;
  revenueThisMonth: number;
}

export interface SalesReport {
  date: string;
  total: number;
  count: number;
}
