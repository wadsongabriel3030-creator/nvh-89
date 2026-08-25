import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPermissionsState {
  loading: boolean;
  isAdmin: boolean;
  isMiniAdmin: boolean;
  isLider: boolean;
  isServidor: boolean;
  permissions: string[]; // empty array + !isAdmin means no restricted-page access
}

export function usePermissions(): UserPermissionsState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<UserPermissionsState>({ loading: true, isAdmin: false, isMiniAdmin: false, isLider: false, isServidor: false, permissions: [] });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState({ loading: false, isAdmin: false, isMiniAdmin: false, isLider: false, isServidor: false, permissions: [] });
      return;
    }
    let active = true;
    (async () => {
      const [{ data: roles }, { data: perms }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id),
        supabase.from('user_permissions').select('permissions').eq('user_id', user.id).maybeSingle(),
      ]);
      if (!active) return;
      const roleList = (roles ?? []).map((r: any) => r.role as string);
      const isAdmin = roleList.includes('admin');
      const isMiniAdmin = roleList.includes('mini_admin');
      const isLider = roleList.includes('leader');
      const isServidor = roleList.includes('server');
      setState({
        loading: false,
        isAdmin,
        isMiniAdmin,
        isLider,
        isServidor,
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

/**
 * Returns the permissions for the /members (Comunidad) page based on the user's role.
 *
 * Admin:              Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Miniadministrador:  Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Líder:              Ver ✅  Crear ✅  Editar ❌  Eliminar ❌
 * Servidor:           Ver ✅  Crear ❌  Editar ❌  Eliminar ❌
 */
export function getMembersPermissions(state: UserPermissionsState) {
  if (state.isAdmin || state.isMiniAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (state.isLider) {
    return { canView: true, canCreate: true, canEdit: false, canDelete: false };
  }
  // Servidor or any other role
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
}

/**
 * Returns the permissions for the /events (Eventos) page based on the user's role.
 *
 * Admin:              Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Miniadministrador:  Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Líder:              Ver ✅  Crear ✅  Editar ❌  Eliminar ❌
 * Servidor:           Ver ✅  Crear ❌  Editar ❌  Eliminar ❌
 */
export function getEventsPermissions(state: UserPermissionsState) {
  if (state.isAdmin || state.isMiniAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (state.isLider) {
    return { canView: true, canCreate: true, canEdit: false, canDelete: false };
  }
  // Servidor or any other role
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
}

/**
 * Returns the permissions for the /tags (Etiquetas) page based on the user's role.
 *
 * Admin:              Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Miniadministrador:  Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Líder:              Ver ✅  Crear ✅  Editar ✅  Eliminar ❌
 * Servidor:           Ver ✅  Crear ❌  Editar ❌  Eliminar ❌
 */
export function getTagsPermissions(state: UserPermissionsState) {
  if (state.isAdmin || state.isMiniAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (state.isLider) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: false };
  }
  // Servidor or any other role
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
}

/**
 * Returns the permissions for the /calendar-2026 page based on the user's role.
 *
 * Admin:              Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Miniadministrador:  Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Líder:              Ver ✅  Crear ✅  Editar ✅  Eliminar ❌
 * Servidor:           Ver ✅  Crear ❌  Editar ❌  Eliminar ❌
 */
export function getCalendarPermissions(state: UserPermissionsState) {
  if (state.isAdmin || state.isMiniAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (state.isLider) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: false };
  }
  // Servidor or any other role
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
}

/**
 * Returns the permissions for all Reunión Dominical pages:
 * /recursos, /programa, /frases, /versiculos, /anuncios, /reporte-dominical
 *
 * Admin:              Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Miniadministrador:  Ver ✅  Crear ✅  Editar ✅  Eliminar ✅
 * Líder:              Ver ✅  Crear ✅  Editar ✅  Eliminar ❌
 * Servidor:           Ver ✅  Crear ❌  Editar ❌  Eliminar ❌
 */
export function getReunionDominicalPermissions(state: UserPermissionsState) {
  if (state.isAdmin || state.isMiniAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (state.isLider) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: false };
  }
  // Servidor or any other role
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
}
