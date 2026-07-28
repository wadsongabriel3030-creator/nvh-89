import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { MEMBER_PROGRESS_EVENT } from '@/lib/memberProgressEvents';

type Clase = {
  key: string;
  label: string;
  storageKeys?: string[];
  appStorageKeys?: string[];
  appStorageAttendanceKeys?: string[];
  discipuladoCurso?: string;
  discipuladoLeccion?: string;
  discipleshipCourseSlug?: string;
  enrollmentColumn?: boolean;
  reporteKey?: string;
  reporteLeccion?: string;
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

const DISCIPLESHIP_COURSE_IDS: Record<string, string> = {
  '3': 'administracion',
  '4': 'la-familia',
  '5': 'creencias-basicas',
};

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
        appStorageKeys: ['membresia-participants-v1'],
        reporteKey: 'membresia',
        reporteLeccion: 'Vida Nuevos Hechos',
        dbStudents: ['membresia_students', 'nuevos_comienzos_participants'],
      },
      {
        key: 'pp_arrepentimiento',
        label: 'Pasos Firmes – Arrepentimiento',
        reporteKey: 'arrepentimiento',
        reporteLeccion: 'Arrepentimiento de Obras Muertas',
      },
      {
        key: 'pp_cambio_de_reino',
        label: 'Pasos Firmes – Cambio de Reino',
        reporteKey: 'cambio-de-reino',
        reporteLeccion: 'Cambio de Reino',
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
        'Semana 0 – Video de Introducción',
        'Semana 1 – Oración y Ayuno',
        'Semana 2 – Leer, Predicar y Practicar',
        'Semana 3 – Adoración',
        'Semana 4 – Mayordomía',
        'Semana 5 – Testificar',
        'Semana 6 – Sencillez',
        'Semana 7 – Servicio',
      ].map((l, i) => ({
        key: `de_${i}`,
        label: `Pasos Firmes – Disciplinas Espirituales – ${l}`,
        reporteKey: 'disciplinas-espirituales',
        reporteLeccion: l,
      })),
      {
        key: 'pp_dia_antes',
        label: 'Pasos Firmes – Día Antes',
        reporteKey: 'dia-antes',
        reporteLeccion: 'Día Antes',
      },
      {
        key: 'alo',
        label: 'Pasos Firmes – Abrir los Ojos',
        storageKeys: ['abrir-los-ojos-participants'],
        reporteKey: 'abrir-los-ojos',
        reporteLeccion: 'Abrir los Ojos',
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
      ...([
        'Semana 1 – Notas del Video: El Árbol de La Vida',
        'Semana 2 – El Árbol del Conocimiento del Bien y del Mal',
        'Semana 3 – El Árbol de La Vida',
        'Semana 4 – Orden Espiritual',
        'Semana 5 – Notas del Video: La Abundancia del Corazón',
        'Semana 6 – Una Vida de Entrega',
        'Semana 7 – El Perdón',
        'Semana 8 – El Poder de las Palabras',
        'Semana 9 – La Palabra Viva',
        'Semana 10 – Notas del Video: Vasijas de Honra',
        'Semana 11 – Vasijas de Honra',
        'Semana 12 – Adoración',
      ].map((l, i) => ({
        key: `cvl_${i}`,
        label: l,
        reporteKey: 'curso-vida-libertad',
        reporteLeccion: l,
        ...(i === 0
          ? {
              storageKeys: ['curso-vida-libertad-participants'],
              appStorageKeys: ['vl-enrolled-curso-vida-libertad'],
              appStorageAttendanceKeys: ['vl-attendance-curso-vida-libertad'],
            }
          : {}),
      }))),
      {
        key: 'rvl',
        label: 'Retiro Vida en Libertad',
        storageKeys: ['retiro-vida-libertad-participants', 'inscripcion-retiro-vida-libertad'],
        appStorageKeys: ['vl-enrolled-retiro-vida-libertad'],
        appStorageAttendanceKeys: ['vl-attendance-retiro-vida-libertad'],
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
        discipleshipCourseSlug: 'administracion',
        enrollmentColumn: true,
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
        discipleshipCourseSlug: 'la-familia',
        enrollmentColumn: true,
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
        discipleshipCourseSlug: 'creencias-basicas',
        enrollmentColumn: true,
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
      extractMemberIdsFromValue(parsed).forEach((id) => ids.add(id));
    } catch {
      // ignora
    }
  }
  return ids;
}

function extractMemberIdsFromValue(value: unknown): Set<string> {
  const ids = new Set<string>();
  if (!value) return ids;

  if (typeof value === 'string') {
    ids.add(value);
    return ids;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractMemberIdsFromValue(item).forEach((id) => ids.add(id));
    }
    return ids;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj.memberId) ids.add(String(obj.memberId));
    if (obj.id) ids.add(String(obj.id));
  }

  return ids;
}

function readDiscipleshipEnrollment(): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  if (typeof window === 'undefined') return map;

  try {
    const raw = localStorage.getItem('discipleship-courses-v1');
    if (!raw) return map;
    const saved = JSON.parse(raw) as Record<string, { id?: string }[]>;
    for (const [courseId, students] of Object.entries(saved)) {
      const slug = DISCIPLESHIP_COURSE_IDS[courseId];
      if (!slug || !Array.isArray(students)) continue;
      if (!map[slug]) map[slug] = new Set();
      for (const s of students) {
        if (s?.id) map[slug].add(String(s.id));
      }
    }
  } catch {
    // ignora
  }

  return map;
}

function matchNamesToMemberIds(
  names: Set<string>,
  members: { id: string; firstName: string; lastName: string }[]
): Set<string> {
  const ids = new Set<string>();
  members.forEach((m) => {
    const full = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
    if (names.has(full)) ids.add(m.id);
  });
  return ids;
}

function collectReportMemberIds(
  reports: ClassReportRow[],
  match: (r: ClassReportRow) => boolean,
  members: { id: string; firstName: string; lastName: string }[]
): Set<string> {
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const r of reports) {
    if (!match(r)) continue;
    (r.attendee_ids || []).forEach((id) => ids.add(String(id)));
    (r.attendee_names || []).forEach((n) => names.add(String(n).trim().toLowerCase()));
  }

  matchNamesToMemberIds(names, members).forEach((id) => ids.add(id));
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
  const [appStorageData, setAppStorageData] = useState<Record<string, unknown>>({});

  const area = useMemo(() => AREAS.find((a) => a.id === areaId) ?? AREAS[0], [areaId]);
  const discipleshipEnrollment = useMemo(() => readDiscipleshipEnrollment(), [appStorageData, reports]);

  const loadData = useCallback(async () => {
    const tables = Array.from(
      new Set(AREAS.flatMap((a) => a.clases.flatMap((c) => c.dbStudents ?? [])))
    );

    const appKeys = Array.from(
      new Set(
        AREAS.flatMap((a) =>
          a.clases.flatMap((c) => [
            ...(c.appStorageKeys ?? []),
            ...(c.appStorageAttendanceKeys ?? []),
          ])
        )
      )
    );

    const [reps, plcRes, appStorageRes, ...studentResults] = await Promise.all([
      fetchClassReports(),
      supabase.from('app_storage').select('value').eq('key', 'plc_groups_list').maybeSingle(),
      appKeys.length
        ? supabase.from('app_storage').select('key, value').in('key', appKeys)
        : Promise.resolve({ data: [] as { key: string; value: unknown }[] }),
      ...tables.map((t) => supabase.from(t as 'membresia_students').select('member_id, full_name')),
    ]);

    setReports(reps);

    const storageMap: Record<string, unknown> = {};
    for (const row of appStorageRes.data ?? []) {
      storageMap[row.key] = row.value;
    }
    setAppStorageData(storageMap);

    const studentsMap: Record<string, { member_id: string | null; full_name: string | null }[]> = {};
    tables.forEach((t, i) => {
      studentsMap[t] = (studentResults[i]?.data ?? []) as {
        member_id: string | null;
        full_name: string | null;
      }[];
    });
    setDbStudents(studentsMap);

    const ids = new Set<string>();
    const groups = plcRes.data?.value;
    if (Array.isArray(groups)) {
      for (const raw of groups) {
        const g = raw as { leaderId?: unknown; members?: unknown } | null;
        if (g?.leaderId) ids.add(String(g.leaderId));
        if (Array.isArray(g?.members)) g.members.forEach((id) => ids.add(String(id)));
      }
    }
    setPlcMemberIds(ids);
  }, []);

  useEffect(() => {
    loadData();
    const onUpdate = () => loadData();
    window.addEventListener(MEMBER_PROGRESS_EVENT, onUpdate);
    window.addEventListener('storage', onUpdate);
    window.addEventListener('focus', onUpdate);
    return () => {
      window.removeEventListener(MEMBER_PROGRESS_EVENT, onUpdate);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, [loadData]);

  const progressMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};

    for (const c of area.clases) {
      const ids = new Set<string>();

      if (c.discipuladoCurso && c.discipuladoLeccion) {
        collectReportMemberIds(
          reports,
          (r) => r.area === `discipulado:${c.discipuladoCurso}` && r.leccion === c.discipuladoLeccion,
          members
        ).forEach((id) => ids.add(id));
      }

      if (c.reporteKey && c.reporteLeccion) {
        collectReportMemberIds(
          reports,
          (r) => r.area === c.reporteKey && r.leccion === c.reporteLeccion,
          members
        ).forEach((id) => ids.add(id));
      }

      if (c.dbStudents?.length) {
        const names = new Set<string>();
        for (const t of c.dbStudents) {
          (dbStudents[t] ?? []).forEach((s) => {
            if (s.member_id) ids.add(String(s.member_id));
            if (s.full_name) names.add(String(s.full_name).trim().toLowerCase());
          });
        }
        matchNamesToMemberIds(names, members).forEach((id) => ids.add(id));
      }

      if (c.appStorageKeys?.length) {
        for (const key of c.appStorageKeys) {
          extractMemberIdsFromValue(appStorageData[key]).forEach((id) => ids.add(id));
        }
      }

      if (c.appStorageAttendanceKeys?.length) {
        for (const key of c.appStorageAttendanceKeys) {
          const sessions = appStorageData[key];
          if (!Array.isArray(sessions)) continue;
          for (const session of sessions) {
            if (session && typeof session === 'object' && Array.isArray((session as { presentIds?: string[] }).presentIds)) {
              (session as { presentIds: string[] }).presentIds.forEach((id) => ids.add(String(id)));
            }
          }
        }
      }

      if (c.storageKeys?.length) {
        readMemberIds(c.storageKeys).forEach((id) => ids.add(id));
      }

      if (c.enrollmentColumn && c.discipleshipCourseSlug) {
        (discipleshipEnrollment[c.discipleshipCourseSlug] ?? new Set()).forEach((id) => ids.add(id));
      }

      if (c.key === 'plc') {
        members.forEach((m) => {
          if (m.plcGroupId) ids.add(m.id);
          if (m.tags?.some((t) => t.category === 'plc')) ids.add(m.id);
          if (plcMemberIds.has(m.id)) ids.add(m.id);
        });
      }

      map[c.key] = ids;
    }

    return map;
  }, [area, members, reports, dbStudents, plcMemberIds, appStorageData, discipleshipEnrollment]);

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
