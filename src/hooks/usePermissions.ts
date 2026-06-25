import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPermissionsState {
  loading: boolean;
  isAdmin: boolean;
  permissions: string[]; // empty array + !isAdmin means no restricted-page access
}

export function usePermissions(): UserPermissionsState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<UserPermissionsState>({ loading: true, isAdmin: false, permissions: [] });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState({ loading: false, isAdmin: false, permissions: [] });
      return;
    }
    let active = true;
    (async () => {
      const [{ data: roles }, { data: perms }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id),
        supabase.from('user_permissions').select('permissions').eq('user_id', user.id).maybeSingle(),
      ]);
      if (!active) return;
      const isAdmin = (roles ?? []).some((r: any) => r.role === 'admin');
      setState({
        loading: false,
        isAdmin,
        permissions: (perms?.permissions as string[] | undefined) ?? [],
      });
    })();
    return () => { active = false; };
  }, [user, authLoading]);

  return state;
}

export function canAccessPath(state: UserPermissionsState, path: string): boolean {
  if (state.isAdmin) return true;
  // Exact match
  if (state.permissions.includes(path)) return true;
  // Dynamic sub-routes: e.g. /reporte-pasos-firmes/xyz → check if /primeros-pasos is permitted
  // Or /reporte-abrir-los-ojos → check if /abrir-los-ojos is permitted
  // Generic prefix match: allow access if any permitted path is a prefix of the current path
  return state.permissions.some(p => p !== '/' && path.startsWith(p + '/'));
}
