import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  currentPage: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  darkMode: false,
  currentPage: 'dashboard',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: newMode };
    }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
