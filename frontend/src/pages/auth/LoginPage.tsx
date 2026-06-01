import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { validateRequired } from '@/utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailErr = validateRequired(email, 'Email');
    if (emailErr) newErrors.email = emailErr;
    const passErr = validateRequired(password, 'Password');
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || 'Login gagal. Periksa email dan password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Selamat Datang Kembali
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Silakan masuk ke akun Anda
      </p>

      {apiError && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: '' }));
          }}
          error={errors.email}
          required
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          <LogIn className="w-5 h-5" />
          Masuk
        </Button>
      </form>
    </div>
  );
}
