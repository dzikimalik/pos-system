import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Barcode,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Printer,
  X,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency, generateInvoiceNumber } from '@/utils/format';
import { useCartStore } from '@/stores/cartStore';
import { Product, Category, Transaction } from '@/types';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { createTransaction } from '@/api/transactions';
import toast from 'react-hot-toast';

export default function CashierPage() {
  const {
    items,
    discount,
    tax,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDiscount,
    setTax,
    getSubtotal,
    getTaxAmount,
    getTotal,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories({ limit: 100 }),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }
    setSearchResults(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;
    const found = products.find(
      (p) => p.barcode === barcodeInput.trim()
    );
    if (found) {
      addItem({ id: found.id, name: found.name, price: found.price });
      setBarcodeInput('');
      toast.success(`${found.name} ditambahkan`);
    } else {
      toast.error('Produk tidak ditemukan');
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch();
    }
  };

  const handleAddProduct = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price });
    toast.success(`${product.name} ditambahkan`);
  };

  const total = getTotal();
  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const changeAmount = cashAmount - total;

  const handlePayment = async () => {
    if (items.length === 0) return;
    if (paymentMethod === 'cash' && cashAmount < total) {
      toast.error('Jumlah uang tidak mencukupi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTransaction({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax: taxAmount,
        discount,
        total,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? cashAmount : total,
        changeAmount: paymentMethod === 'cash' ? (cashAmount - total) : 0,
      });
      setReceiptTransaction(res.data);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      clearCart();
      setCashAmount(0);
      setPaymentMethod('cash');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transaksi gagal');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { window.print(); return; }
    const receiptEl = document.querySelector('.receipt-print');
    if (!receiptEl) { window.print(); return; }
    printWindow.document.write(`
      <html><head><title>Struk Pembayaran</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 2px; text-align: left; }
        th { border-bottom: 1px dashed #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .border-t { border-top: 1px dashed #000; }
        .mt-2 { margin-top: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
      </style></head><body>
      ${receiptEl.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* LEFT PANEL - Products */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Search & Barcode */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative w-48">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan barcode"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories
            .filter((c) => c.isActive)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p>Tidak ada produk ditemukan</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {searchResults
                .filter((p) => p.isActive)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    disabled={product.stock <= 0}
                    className="bg-white rounded-xl border border-gray-200 p-3 text-left hover:shadow-md hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-primary-600 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stok: {product.stock}
                    </p>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Cart */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Keranjang ({items.length})
            </h3>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="w-4 h-4 text-danger-500" />
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 mb-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <ShoppingCart className="w-10 h-10 mb-2" />
                <p className="text-sm">Keranjang kosong</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 w-20 text-right">
                    {formatCurrency(item.subtotal)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-300 hover:text-danger-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Discount & Tax */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Diskon
                </label>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  value={tax || ''}
                  onChange={(e) => setTax(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1 border-t border-gray-200 pt-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-danger-500">
                <span>Diskon</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Pajak ({tax}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            className="w-full mt-4"
            size="lg"
            disabled={items.length === 0}
            onClick={() => setShowPaymentModal(true)}
          >
            <CreditCard className="w-5 h-5" />
            Bayar {formatCurrency(total)}
          </Button>
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pembayaran"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Pembayaran</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'cash', label: 'Tunai', icon: Banknote },
                { value: 'debit', label: 'Debit', icon: CreditCard },
                { value: 'qris', label: 'QRIS', icon: Smartphone },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => {
                    setPaymentMethod(method.value);
                    if (method.value !== 'cash') setCashAmount(total);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors ${
                    paymentMethod === method.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <Input
              label="Jumlah Uang"
              type="number"
              value={cashAmount || ''}
              onChange={(e) => setCashAmount(Number(e.target.value))}
              placeholder="Masukkan jumlah uang"
            />
          )}

          {paymentMethod === 'cash' && cashAmount >= total && (
            <div className="bg-success-50 rounded-lg p-3">
              <p className="text-sm text-success-700">
                Kembalian:{' '}
                <span className="font-bold">
                  {formatCurrency(changeAmount)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowPaymentModal(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              loading={submitting}
              onClick={handlePayment}
              disabled={
                paymentMethod === 'cash' && cashAmount < total
              }
            >
              Konfirmasi Pembayaran
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Struk Pembayaran"
        size="sm"
      >
        {receiptTransaction && (
          <div className="receipt-print">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">Modern POS System</h3>
              <p className="text-xs text-gray-500">
                {receiptTransaction.invoiceNumber}
              </p>
            </div>

            <div className="border-t border-b border-dashed border-gray-300 py-2 mb-2 text-sm">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="text-left">Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptTransaction.items.map((item) => (
                    <tr key={item.id}>
                      <td className="text-left">{item.productName}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(receiptTransaction.subtotal)}</span>
              </div>
              {receiptTransaction.discount > 0 && (
                <div className="flex justify-between text-danger-500">
                  <span>Diskon</span>
                  <span>-{formatCurrency(receiptTransaction.discount)}</span>
                </div>
              )}
              {receiptTransaction.tax > 0 && (
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>{formatCurrency(receiptTransaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1">
                <span>Total</span>
                <span>{formatCurrency(receiptTransaction.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tunai</span>
                <span>{formatCurrency(receiptTransaction.cashAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Kembali</span>
                <span>{formatCurrency(receiptTransaction.changeAmount)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Terima kasih telah berbelanja
            </p>

            <div className="flex gap-2 mt-4 no-print">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowReceiptModal(false)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={handlePrintReceipt}>
                <Printer className="w-4 h-4" />
                Cetak
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
