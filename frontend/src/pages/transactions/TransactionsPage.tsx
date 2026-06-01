import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import Select from '@/components/ui/Select';
import TransactionsTable from '@/components/tables/TransactionsTable';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/transactions';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({
        page,
        limit: 10,
        search,
        status: status || undefined,
        startDate,
        endDate,
      });
      setTransactions(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Cari invoice..."
            />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'COMPLETED', label: 'Selesai' },
              { value: 'PENDING', label: 'Tertunda' },
              { value: 'REFUNDED', label: 'Refund' },
              { value: 'CANCELLED', label: 'Dibatalkan' },
            ]}
            placeholder="Semua Status"
          />
        </div>
        <Button variant="outline" onClick={fetchTransactions}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card padding={false}>
        <TransactionsTable
          data={transactions}
          loading={loading}
          onRowClick={(t) => navigate(`/transactions/${t.id}`)}
          pagination={{
            page,
            totalPages,
            total,
            onPageChange: setPage,
          }}
        />
      </Card>
    </div>
  );
}
