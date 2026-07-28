export interface PagePermission {
  path: string;
  label: string;
  group: string;
}

export const AVAILABLE_PAGES: PagePermission[] = [
  { path: '/', label: 'Dashboard', group: 'Principal' },
  { path: '/members', label: 'Miembros', group: 'Personas' },
  { path: '/tags', label: 'Etiquetas', group: 'Personas' },

  { path: '/listado-lideres', label: 'Listado de Maestros', group: 'Personas' },

  { path: '/events', label: 'Eventos', group: 'Eventos' },
  { path: '/calendar-2026', label: 'Calendario 2026', group: 'Eventos' },

  { path: '/plc', label: 'PLC', group: 'PLC' },
  { path: '/resumen-plc', label: 'Resumen PLC', group: 'PLC' },
  { path: '/reporte-plc', label: 'Reporte PLC', group: 'PLC' },

  { path: '/membresia', label: 'Nuevos Comienzos', group: 'Discipulado' },
  { path: '/reporte-membresia', label: 'Reporte Membresía', group: 'Discipulado' },

  { path: '/discipleship', label: 'Discipulado', group: 'Discipulado' },
  { path: '/cursos', label: 'Cursos', group: 'Discipulado' },
  { path: '/reporte-discipulado', label: 'Reporte Discipulado', group: 'Discipulado' },
  { path: '/reuniones-discipuladores', label: 'Reuniones de mentores', group: 'Discipulado' },
  { path: '/guia-reunion-discipulado', label: 'Guía Reunión Discipulado', group: 'Discipulado' },
  { path: '/proceso-discipular', label: 'Proceso Discipular', group: 'Discipulado' },
  { path: '/primeros-pasos', label: 'Primeros Pasos', group: 'Discipulado' },
  { path: '/curso-vida-libertad', label: 'Curso Vida en Libertad', group: 'Discipulado' },
  { path: '/retiro-vida-libertad', label: 'Retiro Vida en Libertad', group: 'Discipulado' },
  { path: '/compromiso-vnh', label: 'Compromiso VNH', group: 'Discipulado' },
  { path: '/discipulador', label: 'Discipulador', group: 'Discipulado' },

  { path: '/batismos', label: 'Bautismos', group: 'Bautismos' },

  { path: '/prayer-guide', label: 'Guía de Oración', group: 'Oración' },
  { path: '/secreto-de-daniel', label: 'Secreto de Daniel', group: 'Oración' },
  { path: '/oracion-247', label: 'Oración 24/7', group: 'Oración' },
  { path: '/cuarto-de-guerra', label: 'Cuarto de Guerra', group: 'Oración' },

  { path: '/tithes', label: 'Diezmos', group: 'Finanzas' },
  { path: '/registro-diezmos', label: 'Registro de Diezmos', group: 'Finanzas' },
  { path: '/recibo-donacion', label: 'Recibo de Donación', group: 'Finanzas' },

  { path: '/testimonies', label: 'Testimonios', group: 'Comunicación' },
  { path: '/reunion-dominical/recursos', label: 'Reunión Dominical - Anuncios', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/programa', label: 'Reunión Dominical - Programa', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/frases', label: 'Reunión Dominical - Frases', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/versiculos', label: 'Reunión Dominical - Versículos', group: 'Reunión Dominical' },
  { path: '/reunion-dominical/anuncios', label: 'Reunión Dominical - Recursos', group: 'Reunión Dominical' },
  { path: '/reporte-dominical', label: 'Reporte Dominical', group: 'Reunión Dominical' },

  { path: '/reports', label: 'Reportes', group: 'Sistema' },
  { path: '/settings', label: 'Configuración', group: 'Sistema' },
];

export type UserAccountRole = 'admin' | 'lider' | 'servidor';

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
