import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProductsPage from '@/pages/products/ProductsPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import CustomersPage from '@/pages/customers/CustomersPage';
import CashierPage from '@/pages/cashier/CashierPage';
import TransactionsPage from '@/pages/transactions/TransactionsPage';
import TransactionDetailPage from '@/pages/transactions/TransactionDetailPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout />
        }
      >
        <Route index element={<LoginPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProtectedRoute requiredRole="admin"><ProductsPage /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute requiredRole="admin"><CategoriesPage /></ProtectedRoute>} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="cashier" element={<CashierPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:id" element={<TransactionDetailPage />} />
        <Route path="reports" element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">
                Halaman tidak ditemukan
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
