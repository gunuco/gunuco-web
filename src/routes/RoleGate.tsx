import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/nav';
import { useAuthStore } from '@/store/authStore';
import { homePathForRole } from '@/utils/permissions';

export function RoleGate() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const matches = NAV_ITEMS.filter(
    (n) => location.pathname === n.path || location.pathname.startsWith(`${n.path}/`),
  );
  const item = [...matches].sort((a, b) => b.path.length - a.path.length)[0];
  if (user && item && !item.roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return <Outlet />;
}
