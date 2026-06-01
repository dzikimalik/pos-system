import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
    setUser: store.setUser,
    requireAuth: () => {
      if (!store.isAuthenticated) {
        throw new Error('Authentication required');
      }
      return store.user;
    },
  };
}
