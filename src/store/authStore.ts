import type { AuthUser } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setSession: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user) => set({ user, token: user.token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'gunuco-auth' },
  ),
);
