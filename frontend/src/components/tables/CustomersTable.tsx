import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Customer } from '@/types';
import { Edit2, Trash2 } from 'lucide-react';

interface CustomersTableProps {
  data: Customer[];
  loading?: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function CustomersTable({
  data,
  loading,
  onEdit,
  onDelete,
  pagination,
}: CustomersTableProps) {
  const columns: Column<Customer>[] = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telepon' },
    {
      key: 'address',
      label: 'Alamat',
      render: (item) =>
        item.address ? (
          <span className="truncate max-w-[200px] block">{item.address}</span>
        ) : (
          '-'
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          >
            <Trash2 className="w-4 h-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      pagination={pagination}
      emptyTitle="Tidak ada pelanggan"
      emptyDescription="Belum ada pelanggan yang ditambahkan."
    />
  );
}
