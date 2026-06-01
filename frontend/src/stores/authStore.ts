import { create } from 'zustand';
import { User } from '@/types';
import { login as loginApi, getMe } from '@/api/auth';

function normalizeUser(raw: any): User {
  const roleName = typeof raw.role === 'object' && raw.role ? raw.role.name : raw.role;
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: roleName?.toLowerCase() || '',
    isActive: raw.isActive,
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? normalizeUser(JSON.parse(storedUser)) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,

  login: async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const { token, user } = response.data;
    const normalized = normalizeUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await getMe();
      const normalized = normalizeUser(response.data);
      localStorage.setItem('user', JSON.stringify(normalized));
      set({ user: normalized, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
