import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ALL_ROLES } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';
import { homePathForRole } from '@/utils/permissions';

const QueryProvider = lazy(() =>
  import('@/app/query-provider').then((m) => ({ default: m.QueryProvider })),
);

function isKnownRole(role: unknown): role is Role {
  return ALL_ROLES.includes(role as Role);
}

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  if (user && !isKnownRole(user.role)) {
    logout();
    return <Navigate to="/login" replace />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Suspense fallback={null}>
      <QueryProvider>
        <Outlet />
      </QueryProvider>
    </Suspense>
  );
}

export function GuestRoute() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={homePathForRole(user.role)} replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}
