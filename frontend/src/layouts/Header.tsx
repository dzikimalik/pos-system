import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/customers': 'Customers',
  '/cashier': 'Cashier',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'Page';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast('Tidak ada notifikasi baru', { icon: '🔔' })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-700" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
