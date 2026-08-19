import { create } from 'zustand';

interface Toast {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  sidebarOpen: boolean;
  toast: Toast | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  notify: (message: string, severity?: Toast['severity']) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toast: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  notify: (message, severity = 'success') => set({ toast: { message, severity } }),
  clearToast: () => set({ toast: null }),
}));
