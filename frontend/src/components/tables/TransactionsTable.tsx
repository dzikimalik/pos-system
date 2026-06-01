import Table, { Column } from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Transaction } from '@/types';

interface TransactionsTableProps {
  data: Transaction[];
  loading?: boolean;
  onRowClick?: (transaction: Transaction) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function TransactionsTable({
  data,
  loading,
  onRowClick,
  pagination,
}: TransactionsTableProps) {
  const columns: Column<Transaction>[] = [
    { key: 'invoiceNumber', label: 'Invoice' },
    {
      key: 'createdAt',
      label: 'Tanggal',
      render: (item) => formatDateTime(item.createdAt),
    },
    {
      key: 'customer',
      label: 'Pelanggan',
      render: (item) => item.customer?.name || 'Umum',
    },
    {
      key: 'total',
      label: 'Total',
      render: (item) => formatCurrency(item.total),
    },
    {
      key: 'paymentMethod',
      label: 'Pembayaran',
      render: (item) => item.paymentMethod || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      onRowClick={onRowClick}
      pagination={pagination}
      emptyTitle="Tidak ada transaksi"
      emptyDescription="Belum ada transaksi yang dilakukan."
    />
  );
}
