import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Category } from '@/types';
import { Edit2, Trash2 } from 'lucide-react';

interface CategoriesTableProps {
  data: Category[];
  loading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function CategoriesTable({
  data,
  loading,
  onEdit,
  onDelete,
  pagination,
}: CategoriesTableProps) {
  const columns: Column<Category>[] = [
    { key: 'name', label: 'Nama Kategori' },
    { key: 'description', label: 'Deskripsi' },
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
      emptyTitle="Tidak ada kategori"
      emptyDescription="Belum ada kategori yang ditambahkan."
    />
  );
}
