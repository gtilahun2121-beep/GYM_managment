import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '@gym/shared-types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  roles
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
