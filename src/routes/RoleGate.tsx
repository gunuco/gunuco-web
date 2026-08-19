import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/nav';
import { useAuthStore } from '@/store/authStore';

export function RoleGate() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const item = NAV_ITEMS.find(
    (n) => location.pathname === n.path || location.pathname.startsWith(`${n.path}/`),
  );
  if (user && item && !item.roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
