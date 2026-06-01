import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/stores/uiStore';

export default function DashboardLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 lg:ml-64 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}
      >
        <Header />

        <main className="flex-1 pt-24 px-4 md:px-6 lg:px-8 pb-8">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 bg-white px-6 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Modern POS System. All rights
            reserved.
          </p>
        </footer>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
