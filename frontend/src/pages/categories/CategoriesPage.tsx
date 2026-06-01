import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SearchInput from '@/components/ui/SearchInput';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CategoriesTable from '@/components/tables/CategoriesTable';
import CategoryForm from '@/components/forms/CategoryForm';
import { Category } from '@/types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categories';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories({ page, limit: 10, search });
      setCategories(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = async (data: { name: string; description: string }) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await createCategory(data);
        toast.success('Kategori berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Kategori berhasil dihapus');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus kategori');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Cari kategori..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCategories}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => { setEditingCategory(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <CategoriesTable
          data={categories}
          loading={loading}
          onEdit={(c) => { setEditingCategory(c); setModalOpen(true); }}
          onDelete={(c) => setDeleteTarget(c)}
          pagination={{
            page,
            totalPages,
            total,
            onPageChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </div>
  );
}
