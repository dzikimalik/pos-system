import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Category, Product } from '@/types';
import { getCategories } from '@/api/categories';
import { validateRequired, validateMin } from '@/utils/validation';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  barcode: string;
  categoryId: number | '';
  image?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    sku: '',
    barcode: '',
    categoryId: '',
    image: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        cost: initialData.cost,
        stock: initialData.stock,
        sku: initialData.sku,
        barcode: initialData.barcode,
        categoryId: initialData.categoryId || '',
        image: initialData.image || '',
      });
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const res = await getCategories({ limit: 100 });
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(formData.name, 'Nama produk');
    if (nameErr) newErrors.name = nameErr;

    const priceErr = validateMin(formData.price, 1, 'Harga');
    if (priceErr) newErrors.price = priceErr;

    const stockErr = validateMin(formData.stock, 0, 'Stok');
    if (stockErr) newErrors.stock = stockErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const updateField = (
    field: keyof ProductFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Produk"
        required
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Harga Jual"
          type="number"
          required
          value={formData.price || ''}
          onChange={(e) => updateField('price', Number(e.target.value))}
          error={errors.price}
        />
        <Input
          label="Harga Modal"
          type="number"
          value={formData.cost || ''}
          onChange={(e) => updateField('cost', Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stok"
          type="number"
          required
          value={formData.stock || ''}
          onChange={(e) => updateField('stock', Number(e.target.value))}
          error={errors.stock}
        />
        <Select
          label="Kategori"
          value={formData.categoryId}
          onChange={(e) =>
            updateField('categoryId', e.target.value ? Number(e.target.value) : '')
          }
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          placeholder="Pilih kategori"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => updateField('sku', e.target.value)}
        />
        <Input
          label="Barcode"
          value={formData.barcode}
          onChange={(e) => updateField('barcode', e.target.value)}
        />
      </div>
      <Input
        label="URL Gambar"
        value={formData.image || ''}
        onChange={(e) => updateField('image', e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Simpan' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}
