import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, canAccessPath } from '@/hooks/usePermissions';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const perms = usePermissions();
  const location = useLocation();

  if (loading || perms.loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admins or users with no permissions row yet pass through; others must have explicit access.
  const path = location.pathname;
  if (!perms.isAdmin && perms.permissions.length > 0 && !canAccessPath(perms, path)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Acceso restringido</h1>
          <p className="text-muted-foreground">
            No tiene permisos para acceder a esta página. Contacte con el administrador si necesita acceso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
