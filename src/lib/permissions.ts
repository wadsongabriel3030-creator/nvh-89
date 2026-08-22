export interface PagePermission {
  path: string;
  label: string;
  group: string;
}

export const AVAILABLE_PAGES: PagePermission[] = [
  // ── Principal (sidebar: mainNavItems) ──
  { path: '/', label: 'Resumen Administrativo', group: 'Principal' },
  { path: '/members', label: 'Comunidad', group: 'Principal' },
  { path: '/tags', label: 'Etiquetas', group: 'Principal' },
  { path: '/events', label: 'Eventos', group: 'Principal' },
  { path: '/calendar-2026', label: 'Calendario 2026', group: 'Principal' },

  // ── Reunión Dominical ──
  { path: '/reunion-dominical/recursos', label: 'Anuncios', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/programa', label: 'Programa', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/frases', label: 'Frases Institucionales', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/versiculos', label: 'Versículos', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/anuncios', label: 'Recursos', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/reporte-dominical', label: 'Reporte Dominical (Sub)', group: 'Reunión Dominical' },
  { path: '/reporte-dominical', label: 'Reporte Dominical', group: 'Reunión Dominical' },

  // ── Guía de Oración ──
  { path: '/secreto-de-daniel', label: 'Secreto de Daniel', group: 'Guía de Oración' },
  { path: '/oracion-247', label: 'Oración 24/7', group: 'Guía de Oración' },
  { path: '/cuarto-de-guerra', label: 'Cuarto de Guerra', group: 'Guía de Oración' },

  // ── Diezmos ──
  { path: '/tithes', label: 'Diezmos', group: 'Diezmos' },
  { path: '/registro-diezmos', label: 'Registro de Diezmos', group: 'Diezmos' },
  { path: '/recibo-donacion', label: 'Recibo de Donación', group: 'Diezmos' },

  // ── Testimonios ──
  { path: '/testimonies', label: 'Testimonios', group: 'Testimonios' },

  // ── PLCs ──
  { path: '/plc', label: 'PLCs', group: 'PLCs' },
  { path: '/resumen-plc', label: 'Resumen PLC', group: 'PLCs' },
  { path: '/reporte-plc', label: 'Reporte PLC', group: 'PLCs' },

  // ── Vida en Libertad ──
  { path: '/curso-vida-libertad', label: 'Curso Vida en Libertad', group: 'Vida en Libertad' },
  { path: '/retiro-vida-libertad', label: 'Retiro Vida en Libertad', group: 'Vida en Libertad' },

  // ── Bautismos ──
  { path: '/batismos', label: 'Bautismos', group: 'Bautismos' },

  // ── Discipulado → Discipuladores ──
  { path: '/discipulador', label: 'Discipulador', group: 'Discipulado' },
  { path: '/guia-reunion-discipulado', label: 'Guía de Discipulado', group: 'Discipulado' },
  { path: '/reuniones-discipuladores', label: 'Reuniones de Discipuladores', group: 'Discipulado' },
  { path: '/proceso-discipular', label: 'Proceso Discipular', group: 'Discipulado' },
  { path: '/reporte-discipulado', label: 'Reporte Discipulado', group: 'Discipulado' },

  // ── Escuela de Equipamiento ──
  { path: '/ruta-discipulo', label: 'Ruta', group: 'Escuela de Equipamiento' },
  { path: '/membresia', label: 'Nueva Vida', group: 'Escuela de Equipamiento' },
  { path: '/reporte-membresia', label: 'Reporte Membresía', group: 'Escuela de Equipamiento' },
  { path: '/primeros-pasos', label: 'Pasos Firmes', group: 'Escuela de Equipamiento' },
  { path: '/reporte-pasos-firmes', label: 'Reporte Pasos Firmes', group: 'Escuela de Equipamiento' },
  { path: '/listado-lideres', label: 'Listado de Maestros', group: 'Escuela de Equipamiento' },
  { path: '/cursos', label: 'Cursos', group: 'Escuela de Equipamiento' },
  { path: '/discipleship', label: 'Discipulado (Nivel I)', group: 'Escuela de Equipamiento' },
  { path: '/escuela-equipamiento', label: 'Escuela de Equipamiento', group: 'Escuela de Equipamiento' },
  { path: '/escuela-equipamiento/nivel-i', label: 'Doctrina Básica – Nivel I', group: 'Escuela de Equipamiento' },
  { path: '/compromiso-vnh', label: 'Compromiso VNH', group: 'Escuela de Equipamiento' },

  // ── Sistema ──
  { path: '/reports', label: 'Informes', group: 'Sistema' },
  { path: '/settings', label: 'Configuración', group: 'Sistema' },
];

export type UserAccountRole = 'admin' | 'mini_admin' | 'lider' | 'servidor';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext placeholder until Supabase integration
  role: UserAccountRole;
  permissions: string[]; // list of allowed page paths; admin = all
  createdAt: string;
}

const STORAGE_KEY = 'nh_user_accounts';

export function getAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}
