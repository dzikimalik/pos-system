import { useState, useEffect } from 'react';
import { Package, Receipt, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BestSellingChart from '@/components/charts/BestSellingChart';
import TransactionsTable from '@/components/tables/TransactionsTable';
import { formatCurrency } from '@/utils/format';
import { DashboardStats, Transaction, Product } from '@/types';
import {
  getDashboardStats,
  getBestSellingProducts,
  getRecentTransactions,
} from '@/api/dashboard';

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bestSellingRes, transactionsRes] = await Promise.all([
        getDashboardStats(),
        getBestSellingProducts(),
        getRecentTransactions(),
      ]);
      setStats(statsRes.data);
      setBestSelling(bestSellingRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-danger-600">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      label: 'Total Produk',
      value: String(stats?.totalProducts || 0),
      icon: <Package className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Transaksi',
      value: String(stats?.totalTransactions || 0),
      icon: <Receipt className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Pendapatan Hari Ini',
      value: formatCurrency(stats?.revenueToday || 0),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: formatCurrency(stats?.revenueThisMonth || 0),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="card-hover">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${card.color} bg-opacity-10 flex items-center justify-center`}
              >
                <div className={`${card.color.replace('bg-', 'text-')} bg-opacity-100`}>
                  {card.icon}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingChart
          data={bestSelling.map((p: any) => ({ name: p.productName || p.name, total: p.totalRevenue || p.totalQuantity || 0 }))}
        />
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Transaksi Terbaru
          </h3>
          <TransactionsTable data={recentTransactions.slice(0, 5)} />
        </Card>
      </div>
    </div>
  );
}
