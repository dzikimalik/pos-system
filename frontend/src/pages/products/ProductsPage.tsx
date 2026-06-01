import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SearchInput from '@/components/ui/SearchInput';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProductsTable from '@/components/tables/ProductsTable';
import ProductForm, { ProductFormData } from '@/components/forms/ProductForm';
import { Product } from '@/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/api/products';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit: 10, search });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Produk berhasil diperbarui');
      } else {
        await createProduct(data as any);
        toast.success('Produk berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Produk berhasil dihapus');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus produk');
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
            placeholder="Cari produk..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <ProductsTable
          data={products}
          loading={loading}
          onEdit={openEditModal}
          onDelete={(p) => setDeleteTarget(p)}
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
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
        size="lg"
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleting}
      />
    </div>
  );
}
