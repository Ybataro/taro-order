import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission, getDefaultPage } from '../constants/permissions';

interface RoleGuardProps {
  path: string;
  children: React.ReactNode;
}

export default function RoleGuard({ path, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/admin" replace />;

  if (!hasPermission(user.role, path)) {
    return <Navigate to={getDefaultPage(user.role)} replace />;
  }

  return <>{children}</>;
}
