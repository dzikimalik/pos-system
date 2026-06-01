import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Receipt,
  DollarSign,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RevenueChart from '@/components/charts/RevenueChart';
import { formatCurrency, formatDate } from '@/utils/format';
import { SalesReport } from '@/types';
import {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getProductSales,
} from '@/api/reports';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

type TabType = 'daily' | 'weekly' | 'monthly' | 'products';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesReport[]>([]);
  const [summary, setSummary] = useState({ total: 0, count: 0, average: 0 });

  const [dailyDate, setDailyDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weekStart, setWeekStart] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 7)),
      'yyyy-MM-dd'
    )
  );
  const [weekEnd, setWeekEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [monthYear, setMonthYear] = useState(new Date().getFullYear());
  const [monthMonth, setMonthMonth] = useState(new Date().getMonth() + 1);
  const [productStart, setProductStart] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      'yyyy-MM-dd'
    )
  );
  const [productEnd, setProductEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'daily':
          res = await getDailySales(dailyDate);
          break;
        case 'weekly':
          res = await getWeeklySales(weekStart, weekEnd);
          break;
        case 'monthly':
          res = await getMonthlySales(monthYear, monthMonth);
          break;
        case 'products':
          res = await getProductSales({
            startDate: productStart,
            endDate: productEnd,
          });
          break;
      }
      if (res?.data) {
        const d: any = res.data;
        let reportList: SalesReport[] = [];

        if (Array.isArray(d)) {
          reportList = d;
        } else if (activeTab === 'daily') {
          reportList = (d.transactions || []).map((t: any) => ({
            date: t.createdAt?.split?.('T')[0] || d.date || '',
            total: t.total,
            count: 1,
          }));
          setSummary({ total: d.totalRevenue || 0, count: d.totalTransactions || reportList.length, average: d.averageTransaction || 0 });
          setData(reportList);
          return;
        } else if (activeTab === 'weekly' && d.dailyBreakdown) {
          reportList = Object.entries(d.dailyBreakdown).map(([date, val]: [string, any]) => ({
            date,
            total: val.revenue || 0,
            count: val.count || 0,
          }));
        } else if (activeTab === 'monthly' && d.weeklyBreakdown) {
          reportList = Object.entries(d.weeklyBreakdown).map(([week, val]: [string, any]) => ({
            date: week,
            total: val.revenue || 0,
            count: val.count || 0,
          }));
        } else if (d.totalRevenue !== undefined) {
          reportList = [{
            date: d.date || `${d.year || ''}-${d.month || ''}`,
            total: d.totalRevenue,
            count: d.totalTransactions,
          }];
        }

        const total = reportList.reduce((sum, r) => sum + r.total, 0);
        const count = reportList.reduce((sum, r) => sum + r.count, 0);
        setSummary({ total, count, average: count > 0 ? total / count : 0 });
        setData(reportList);
      }
    } catch (err: any) {
      toast.error('Gagal memuat laporan');
      setData([]);
      setSummary({ total: 0, count: 0, average: 0 });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Tanggal: item.date,
        Pendapatan: item.total,
        Transaksi: item.count,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `laporan-${activeTab}-${Date.now()}.xlsx`);
    toast.success('File Excel berhasil diunduh');
  };

  const exportToCSV = () => {
    const headers = 'Tanggal,Pendapatan,Transaksi\n';
    const rows = data
      .map((item) => `${item.date},${item.total},${item.count}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${activeTab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File CSV berhasil diunduh');
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'daily', label: 'Harian' },
    { key: 'weekly', label: 'Mingguan' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'products', label: 'Produk' },
  ];

  const chartData = data.map((item) => ({
    label: formatDate(item.date),
    value: item.total,
  }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {activeTab === 'daily' && (
          <input
            type="date"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        )}
        {activeTab === 'weekly' && (
          <>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">s/d</span>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <select
              value={monthMonth}
              onChange={(e) => setMonthMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('id', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={monthYear}
              onChange={(e) => setMonthYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - 2 + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </>
        )}
        {activeTab === 'products' && (
          <>
            <input
              type="date"
              value={productStart}
              onChange={(e) => setProductStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">s/d</span>
            <input
              type="date"
              value={productEnd}
              onChange={(e) => setProductEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </>
        )}
        <Button variant="primary" size="sm" onClick={fetchData}>
          <BarChart3 className="w-4 h-4" />
          Tampilkan
        </Button>
        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileText className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pendapatan</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(summary.total)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Transaksi</p>
              <p className="text-lg font-bold text-gray-900">
                {summary.count}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Rata-rata</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(summary.average)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <RevenueChart data={chartData} title="Grafik Pendapatan" />

      {/* Data Table */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Detail Laporan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Pendapatan
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Transaksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
