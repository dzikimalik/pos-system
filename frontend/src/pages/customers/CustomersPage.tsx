import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SearchInput from '@/components/ui/SearchInput';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomersTable from '@/components/tables/CustomersTable';
import CustomerForm from '@/components/forms/CustomerForm';
import { Customer } from '@/types';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/api/customers';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ page, limit: 10, search });
      setCustomers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat pelanggan');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
        toast.success('Pelanggan berhasil diperbarui');
      } else {
        await createCustomer(data);
        toast.success('Pelanggan berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pelanggan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success('Pelanggan berhasil dihapus');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus pelanggan');
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
            placeholder="Cari pelanggan..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setEditingCustomer(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <CustomersTable
          data={customers}
          loading={loading}
          onEdit={(c) => {
            setEditingCustomer(c);
            setModalOpen(true);
          }}
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
        title={editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
      >
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pelanggan"
        message={`Apakah Anda yakin ingin menghapus pelanggan "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </div>
  );
}
