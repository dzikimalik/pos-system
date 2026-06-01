import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Customer } from '@/types';
import { validateRequired, validateEmail, validatePhone } from '@/utils/validation';

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(formData.name, 'Nama');
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const updateField = (field: string, value: string) => {
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
        label="Nama Pelanggan"
        required
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={errors.email}
      />
      <Input
        label="Telepon"
        value={formData.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        error={errors.phone}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alamat
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
      </div>
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
