import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['admin'] },
  { to: '/categories', icon: Tags, label: 'Categories', roles: ['admin'] },
  { to: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'cashier'] },
  { to: '/cashier', icon: ShoppingCart, label: 'Cashier', roles: ['admin', 'cashier'] },
  { to: '/transactions', icon: Receipt, label: 'Transactions', roles: ['admin', 'cashier'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'cashier'] },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">POS System</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
