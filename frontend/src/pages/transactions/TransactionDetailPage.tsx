import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Transaction } from '@/types';
import { getTransaction, refundTransaction } from '@/api/transactions';
import toast from 'react-hot-toast';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (id) fetchTransaction(id);
  }, [id]);

  const fetchTransaction = async (transactionId: string) => {
    setLoading(true);
    try {
      const res = await getTransaction(transactionId);
      setTransaction(res.data);
    } catch (err: any) {
      toast.error('Gagal memuat detail transaksi');
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!transaction) return;
    setRefunding(true);
    try {
      const res = await refundTransaction(transaction.id);
      setTransaction(res.data);
      toast.success('Transaksi berhasil direfund');
      setShowRefundConfirm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal melakukan refund');
    } finally {
      setRefunding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Kembali</span>
        </button>
        <div className="flex gap-2">
          {transaction.status === 'COMPLETED' && (
            <Button
              variant="outline"
              onClick={() => setShowRefundConfirm(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Refund
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
        </div>
      </div>

      <Card>
        <div className="receipt-print">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {transaction.invoiceNumber}
              </h2>
              <p className="text-sm text-gray-500">
                {formatDateTime(transaction.createdAt)}
              </p>
            </div>
            <StatusBadge status={transaction.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Pelanggan</p>
              <p className="text-sm font-medium text-gray-900">
                {transaction.customer?.name || 'Umum'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kasir</p>
              <p className="text-sm font-medium text-gray-900">
                {transaction.user?.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Metode Pembayaran</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {transaction.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge
                variant={
                  transaction.status === 'COMPLETED'
                    ? 'success'
                    : transaction.status === 'REFUNDED'
                      ? 'danger'
                      : 'default'
                }
              >
                {transaction.status}
              </Badge>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-3">Item</h3>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">
                  Produk
                </th>
                <th className="text-center py-2 text-gray-500 font-medium">
                  Qty
                </th>
                <th className="text-right py-2 text-gray-500 font-medium">
                  Harga
                </th>
                <th className="text-right py-2 text-gray-500 font-medium">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaction.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-gray-900">{item.productName}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-sm text-danger-500">
                <span>Diskon</span>
                <span>-{formatCurrency(transaction.discount)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Pajak</span>
                <span>{formatCurrency(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tunai</span>
              <span>{formatCurrency(transaction.cashAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Kembali</span>
              <span>{formatCurrency(transaction.changeAmount)}</span>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        onConfirm={handleRefund}
        title="Refund Transaksi"
        message={`Apakah Anda yakin ingin melakukan refund untuk transaksi ${transaction.invoiceNumber}?`}
        confirmLabel="Ya, refund"
        isLoading={refunding}
      />
    </div>
  );
}
