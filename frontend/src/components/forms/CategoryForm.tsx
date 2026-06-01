import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Category } from '@/types';
import { validateRequired } from '@/utils/validation';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(name, 'Nama kategori');
    if (nameErr) newErrors.name = nameErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Kategori"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
