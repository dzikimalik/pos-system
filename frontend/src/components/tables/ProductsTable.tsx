import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';
import { Product } from '@/types';
import { Edit2, Trash2 } from 'lucide-react';

interface ProductsTableProps {
  data: Product[];
  loading?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function ProductsTable({
  data,
  loading,
  onEdit,
  onDelete,
  pagination,
}: ProductsTableProps) {
  const columns: Column<Product>[] = [
    { key: 'name', label: 'Nama Produk' },
    {
      key: 'category',
      label: 'Kategori',
      render: (item) => item.category?.name || '-',
    },
    {
      key: 'price',
      label: 'Harga',
      render: (item) => formatCurrency(item.price),
    },
    {
      key: 'stock',
      label: 'Stok',
      render: (item) => (
        <span
          className={item.stock <= 5 ? 'text-danger-600 font-medium' : ''}
        >
          {item.stock}
        </span>
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
      emptyTitle="Tidak ada produk"
      emptyDescription="Belum ada produk yang ditambahkan."
    />
  );
}
