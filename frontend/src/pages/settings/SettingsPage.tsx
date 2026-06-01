import { useState } from 'react';
import { User, Lock, Store } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { validateRequired } from '@/utils/validation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [storeInfo, setStoreInfo] = useState({
    name: 'Modern POS System',
    address: 'Jl. Contoh No. 123, Jakarta',
    phone: '021-12345678',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const nameErr = validateRequired(profile.name, 'Nama');
    if (nameErr) errors.name = nameErr;
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setUser({ ...user!, name: profile.name, email: profile.email });
      toast.success('Profil berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui profil');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (password.new.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    toast.success('Password berhasil diubah');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informasi toko berhasil disimpan');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card
        header={
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Profil</h3>
          </div>
        }
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            error={profileErrors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
          />
          <div className="flex justify-end">
            <Button type="submit">Simpan Profil</Button>
          </div>
        </form>
      </Card>

      <Card
        header={
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Ubah Password</h3>
          </div>
        }
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            value={password.current}
            onChange={(e) =>
              setPassword((p) => ({ ...p, current: e.target.value }))
            }
          />
          <Input
            label="Password Baru"
            type="password"
            value={password.new}
            onChange={(e) =>
              setPassword((p) => ({ ...p, new: e.target.value }))
            }
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            value={password.confirm}
            onChange={(e) =>
              setPassword((p) => ({ ...p, confirm: e.target.value }))
            }
          />
          <div className="flex justify-end">
            <Button type="submit">Ubah Password</Button>
          </div>
        </form>
      </Card>

      <Card
        header={
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Informasi Toko</h3>
          </div>
        }
      >
        <form onSubmit={handleStoreSubmit} className="space-y-4">
          <Input
            label="Nama Toko"
            value={storeInfo.name}
            onChange={(e) =>
              setStoreInfo((s) => ({ ...s, name: e.target.value }))
            }
          />
          <Input
            label="Alamat"
            value={storeInfo.address}
            onChange={(e) =>
              setStoreInfo((s) => ({ ...s, address: e.target.value }))
            }
          />
          <Input
            label="Telepon"
            value={storeInfo.phone}
            onChange={(e) =>
              setStoreInfo((s) => ({ ...s, phone: e.target.value }))
            }
          />
          <div className="flex justify-end">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
