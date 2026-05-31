import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMembers } from '@/contexts/MembersContext';
import { Check, Minus, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchClassReports, type ClassReportRow } from '@/lib/classReports';

/**
 * Cada "clase" es una columna dentro de un área (página).
 * - storageKeys: claves de localStorage con listas de memberIds (formato legado)
 * - discipuladoCurso/Leccion: matchea reportes guardados en `discipulado-reportes-v1`
 *   (compara por nombre completo del miembro)
 * - reporteKey/reporteLeccion: matchea reportes guardados en `reportes-clases-v1`
 *   (formato unificado por página: { area, leccion, asistentes: [memberId|nombre] })
 */
type Clase = {
  key: string;
  label: string;
  storageKeys?: string[];
  discipuladoCurso?: string;
  discipuladoLeccion?: string;
  reporteKey?: string;
  reporteLeccion?: string;
  /** Tablas de Supabase con alumnos (member_id / full_name) que cuentan para esta clase */
  dbStudents?: string[];
};

type Area = {
  id: string;
  label: string;
  path: string;
  group: string;
  shortLabel?: string;
  clases: Clase[];
};

const GROUP_ORDER = [
  'PLC',
  'Nueva Vida',
  'Vida en Libertad',
  'Discipulado',
] as const;

const AREAS: Area[] = [
  {
    id: 'plc',
    label: 'PLC',
    shortLabel: 'PLC',
    group: 'PLC',
    path: '/plc',
    clases: [
      { key: 'plc', label: 'PLC', storageKeys: ['plc-members', 'plc-participants'] },
    ],
  },
  {
    id: 'nueva-vida',
    label: 'Nueva Vida',
    shortLabel: 'Nueva Vida',
    group: 'Nueva Vida',
    path: '/membresia',
    clases: [
      {
        key: 'vida_nuevos_hechos',
        label: 'Vida Nuevos Hechos',
        storageKeys: ['vida-nuevos-hechos-participants', 'inscripcion-vida-nuevos'],
        dbStudents: ['membresia_students', 'nuevos_comienzos_participants'],
      },
      {
        key: 'pp_arrepentimiento',
        label: 'Pasos Firmes – Arrepentimiento',
        reporteKey: 'arrepentimiento',
        reporteLeccion: 'Lección de Arrepentimiento de Obras Muertas',
      },
      {
        key: 'ed_como',
        label: 'Pasos Firmes – Encuentro Diario (¿Cómo Hacer?)',
        reporteKey: 'encuentro-diario',
        reporteLeccion: '¿Cómo Hacer Tú Encuentro Diario?',
      },
      {
        key: 'ed_plan',
        label: 'Pasos Firmes – Encuentro Diario (Plan Bíblico)',
        reporteKey: 'encuentro-diario',
        reporteLeccion: 'Plan Bíblico Nuevos Hechos',
      },
      ...[
        'Semana 1 – Introducción',
        'Semana 2 – Oración',
        'Semana 3 – Leer, Meditar y Practicar',
        'Semana 4 – Ayuno',
        'Semana 5 – Mayordomía',
        'Semana 6 – Adoración',
        'Semana 7 – Sencillez',
        'Semana 8 – Servicio',
        'Semana 9 – Testificar',
        'Semana 10 – Epílogo',
      ].map((l, i) => ({
        key: `de_${i}`,
        label: `Pasos Firmes – Disciplinas Espirituales – ${l}`,
        reporteKey: 'disciplinas-espirituales',
        reporteLeccion: l,
      })),
      {
        key: 'alo',
        label: 'Abrir Los Ojos',
        storageKeys: ['abrir-los-ojos-participants'],
        reporteKey: 'abrir-los-ojos',
        reporteLeccion: 'Abrir Los Ojos',
      },
    ],
  },
  {
    id: 'vida-en-libertad',
    label: 'Vida en Libertad',
    shortLabel: 'Vida en Libertad',
    group: 'Vida en Libertad',
    path: '/curso-vida-libertad',
    clases: [
      {
        key: 'cvl',
        label: 'Curso Vida en Libertad',
        storageKeys: ['curso-vida-libertad-participants'],
        reporteKey: 'curso-vida-libertad',
        reporteLeccion: 'Curso Vida en Libertad',
      },
      {
        key: 'rvl',
        label: 'Retiro Vida en Libertad',
        storageKeys: ['retiro-vida-libertad-participants', 'inscripcion-retiro-vida-libertad'],
        reporteKey: 'retiro-vida-libertad',
        reporteLeccion: 'Retiro Vida en Libertad',
      },
    ],
  },
  {
    id: 'discipulado',
    label: 'Discipulado',
    shortLabel: 'Discipulado',
    group: 'Discipulado',
    path: '/discipleship',
    clases: [
      {
        key: 'adm_curso',
        label: 'Administración – Curso',
        discipuladoCurso: 'administracion',
        discipuladoLeccion: 'CURSO La Administración',
        dbStudents: ['discipleship_students'],
      },
      {
        key: 'adm_practica',
        label: 'Administración – Práctica',
        discipuladoCurso: 'administracion',
        discipuladoLeccion: 'PRÁCTICA',
      },
      {
        key: 'fam_curso',
        label: 'La Familia – Curso',
        discipuladoCurso: 'la-familia',
        discipuladoLeccion: 'CURSO La Familia',
        dbStudents: ['discipleship_students'],
      },
      {
        key: 'fam_seminario',
        label: 'La Familia – Seminario',
        discipuladoCurso: 'la-familia',
        discipuladoLeccion: 'SEMINARIO FAMILIAR',
      },
      {
        key: 'cb_curso',
        label: 'Creencias Básicas – Curso',
        discipuladoCurso: 'creencias-basicas',
        discipuladoLeccion: 'CURSO Creencias Básicas de la Cristiandad',
        dbStudents: ['creencias_students', 'discipleship_students'],
      },
      {
        key: 'cb_practica',
        label: 'Creencias Básicas – Práctica',
        discipuladoCurso: 'creencias-basicas',
        discipuladoLeccion: 'PRÁCTICA',
      },
    ],
  },
];

function readMemberIds(keys: string[]): Set<string> {

  const ids = new Set<string>();
  if (typeof window === 'undefined') return ids;
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        if (typeof item === 'string') ids.add(item);
        else if (item && typeof item === 'object') {
          if (item.memberId) ids.add(String(item.memberId));
          else if (item.id) ids.add(String(item.id));
        }
      }
    } catch {
      // ignora
    }
  }
  return ids;
}

export function MembersProgressTable() {
  const { members } = useMembers();
  const [search, setSearch] = useState('');
  const [areaId, setAreaId] = useState<string>(AREAS[0].id);
  const [reports, setReports] = useState<ClassReportRow[]>([]);
  const [dbStudents, setDbStudents] = useState<
    Record<string, { member_id: string | null; full_name: string | null }[]>
  >({});
  const [plcMemberIds, setPlcMemberIds] = useState<Set<string>>(new Set());

  const area = useMemo(() => AREAS.find((a) => a.id === areaId) ?? AREAS[0], [areaId]);

  // Carga reportes y alumnos desde el banco de datos
  const loadData = async () => {
    const tables = Array.from(
      new Set(AREAS.flatMap((a) => a.clases.flatMap((c) => c.dbStudents ?? [])))
    );
    const [reps, plcRes, ...studentResults] = await Promise.all([
      fetchClassReports(),
      supabase
        .from('app_storage')
        .select('value')
        .eq('key', 'plc_groups_list')
        .maybeSingle(),
      ...tables.map((t) =>
        supabase.from(t as any).select('member_id, full_name')
      ),
    ]);
    setReports(reps);
    const studentsMap: Record<string, { member_id: string | null; full_name: string | null }[]> = {};
    tables.forEach((t, i) => {
      studentsMap[t] = ((studentResults[i] as any)?.data ?? []) as {
        member_id: string | null;
        full_name: string | null;
      }[];
    });
    setDbStudents(studentsMap);

    // Recolecta todos los IDs de miembros y líderes registrados en algún PLC
    const ids = new Set<string>();
    const groups = (plcRes as any)?.data?.value;
    if (Array.isArray(groups)) {
      for (const g of groups) {
        if (g?.leaderId) ids.add(String(g.leaderId));
        if (Array.isArray(g?.members)) g.members.forEach((id: string) => ids.add(String(id)));
      }
    }
    setPlcMemberIds(ids);
  };

  useEffect(() => {
    loadData();
    const onStorage = () => loadData();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const progressMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const c of area.clases) {
      const ids = new Set<string>();

      // Reportes de Discipulado guardados en el banco (area = discipulado:<curso>)
      if (c.discipuladoCurso && c.discipuladoLeccion) {
        const names = new Set<string>();
        for (const r of reports) {
          if (
            r.area === `discipulado:${c.discipuladoCurso}` &&
            r.leccion === c.discipuladoLeccion
          ) {
            (r.attendee_ids || []).forEach((id) => ids.add(String(id)));
            (r.attendee_names || []).forEach((n) =>
              names.add(String(n).trim().toLowerCase())
            );
          }
        }
        members.forEach((m) => {
          const full = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
          if (names.has(full)) ids.add(m.id);
        });
      }

      // Reportes de clases guardados en el banco (area = reporteKey)
      if (c.reporteKey && c.reporteLeccion) {
        const names = new Set<string>();
        for (const r of reports) {
          if (r.area === c.reporteKey && r.leccion === c.reporteLeccion) {
            (r.attendee_ids || []).forEach((id) => ids.add(String(id)));
            (r.attendee_names || []).forEach((n) =>
              names.add(String(n).trim().toLowerCase())
            );
          }
        }
        members.forEach((m) => {
          const full = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
          if (names.has(full)) ids.add(m.id);
        });
      }

      // Alumnos inscritos en tablas del banco
      if (c.dbStudents?.length) {
        const names = new Set<string>();
        for (const t of c.dbStudents) {
          (dbStudents[t] ?? []).forEach((s) => {
            if (s.member_id) ids.add(String(s.member_id));
            if (s.full_name) names.add(String(s.full_name).trim().toLowerCase());
          });
        }
        members.forEach((m) => {
          const full = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
          if (names.has(full)) ids.add(m.id);
        });
      }

      if (c.storageKeys?.length) {
        readMemberIds(c.storageKeys).forEach((id) => ids.add(id));
      }

      if (c.key === 'plc') {
        members.forEach((m) => {
          if (m.plcGroupId) ids.add(m.id);
          if (m.tags?.some((t) => t.category === 'plc')) ids.add(m.id);
          if (plcMemberIds.has(m.id)) ids.add(m.id);
        });
      }
      if (c.key === 'nuevos_comienzos') {
        members.forEach((m) => {
          if (m.tags?.some((t) => t.category === 'nuevos_comienzos')) ids.add(m.id);
        });
      }

      map[c.key] = ids;
    }
    return map;
  }, [area, members, reports, dbStudents, plcMemberIds]);


  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
  });

  const total = area.clases.length;
  const completedCount = (memberId: string) =>
    area.clases.reduce((acc, c) => acc + (progressMap[c.key]?.has(memberId) ? 1 : 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Desempeño de los Miembros
            </CardTitle>
            <CardDescription>
              Seleccione un área para ver el progreso de los miembros en sus clases
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar miembro..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-muted-foreground">Área / Página:</span>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger className="w-full sm:w-[420px]">
              <SelectValue placeholder="Seleccionar área">
                <span className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {area.group}
                  </Badge>
                  <span className="truncate">{area.shortLabel ?? area.label}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[420px]">
              {GROUP_ORDER.map((g, gi) => {
                const items = AREAS.filter((a) => a.group === g);
                if (items.length === 0) return null;
                return (
                  <SelectGroup key={g}>
                    {gi > 0 && <SelectSeparator />}
                    <SelectLabel className="text-[11px] uppercase tracking-wider text-primary/80">
                      {g}
                    </SelectLabel>
                    {items.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="pl-6">
                        <span className="flex flex-col">
                          <span>{a.shortLabel ?? a.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {a.path}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="font-mono text-xs">
            {area.path}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px] px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground sticky left-0 bg-card">
                    Miembro
                  </th>
                  {area.clases.map((c) => (
                    <th
                      key={c.key}
                      className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const done = completedCount(m.id);
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-border hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 px-3 sticky left-0 bg-card">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {m.firstName} {m.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {m.role}
                          </span>
                        </div>
                      </td>
                      {area.clases.map((c) => {
                        const has = progressMap[c.key]?.has(m.id);
                        return (
                          <td key={c.key} className="text-center py-3 px-3">
                            {has ? (
                              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-success/15 text-success">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-3">
                        <Badge variant={done === total && total > 0 ? 'default' : 'secondary'}>
                          {done}/{total}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={area.clases.length + 2}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Ningún miembro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
