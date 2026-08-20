import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  BarChart3, Download, FileSpreadsheet, Users, Droplets,
  HandHeart, TrendingUp, BookOpen, Loader2, CheckCircle2,
  RefreshCw, Calendar, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDbStorage } from '@/hooks/useDbStorage';
import { PLCGroup } from '@/types';

/* ─────────────────── helpers ─────────────────── */
function cell(v: string | number, t?: string) {
  return { v, t: t ?? (typeof v === 'number' ? 'n' : 's') };
}

function col(wch: number) { return { wch }; }

function addSheet(
  wb: XLSX.WorkBook,
  name: string,
  rows: (string | number | null | undefined)[][],
  colWidths: number[],
  freezeRow = 1,
) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths.map(w => col(w));
  if (freezeRow > 0) ws['!freeze'] = { xSplit: 0, ySplit: freezeRow };
  XLSX.utils.book_append_sheet(wb, ws, name);
}

/* ─────────────────── component ─────────────────── */
export default function Reports() {
  const [exporting, setExporting] = useState<string | null>(null);

  /* ── Fetch all data ── */
  const { data: members = [], isLoading: loadMembers } = useQuery({
    queryKey: ['report_members'],
    queryFn: async () => {
      const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const { data: baptisms = [], isLoading: loadBaptisms } = useQuery({
    queryKey: ['report_baptisms'],
    queryFn: async () => {
      const { data } = await supabase.from('baptisms').select('*').order('scheduled_date', { ascending: false });
      return data ?? [];
    },
  });

  const { data: leaders = [], isLoading: loadLeaders } = useQuery({
    queryKey: ['report_leaders'],
    queryFn: async () => {
      const { data } = await supabase.from('leaders_list').select('*').order('name');
      return data ?? [];
    },
  });

  const { value: plcGroups = [] } = useDbStorage<PLCGroup[]>('plc_groups_list', []);

  /* ── Derived stats ── */
  const totalMembers = members.length;
  const activeMembers = members.filter((m: any) => m.status === 'active').length;
  const inactiveMembers = members.filter((m: any) => m.status === 'inactive').length;
  const activePct = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const completedBaptisms = baptisms.filter((b: any) => b.status === 'completed').length;
  const scheduledBaptisms = baptisms.filter((b: any) => b.status === 'scheduled').length;

  const activePLCs = plcGroups.filter(g => g.isActive).length;
  const totalPLCParticipants = plcGroups.reduce((acc, g) => acc + (g.members?.length ?? 0), 0);

  // Monthly registrations (last 6 months)
  const now = new Date();
  const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
  const monthlyData = months.map(m => {
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const count = members.filter((mb: any) => {
      if (!mb.created_at) return false;
      const d = new Date(mb.created_at);
      return d >= start && d <= end;
    }).length;
    return { label: format(m, 'MMM yy', { locale: es }), count };
  });

  const isLoading = loadMembers || loadBaptisms || loadLeaders;

  /* ─────────────── EXCEL EXPORT FUNCTIONS ─────────────── */

  function exportMembers() {
    setExporting('members');
    try {
      const wb = XLSX.utils.book_new();

      // === Sheet 1: Resumen ===
      const resumeRows = [
        ['INFORME DE MIEMBROS', '', '', ''],
        ['Generado el:', format(new Date(), "dd/MM/yyyy 'a las' HH:mm"), '', ''],
        ['', '', '', ''],
        ['ESTADÍSTICAS GENERALES', '', '', ''],
        ['Indicador', 'Valor', 'Porcentaje', ''],
        ['Total de Miembros', totalMembers, '100%', ''],
        ['Miembros Activos', activeMembers, `${activePct}%`, ''],
        ['Miembros Inactivos', inactiveMembers, `${100 - activePct}%`, ''],
        ['Bautismos Completados', completedBaptisms, '', ''],
        ['Bautismos Agendados', scheduledBaptisms, '', ''],
        ['PLCs Activos', activePLCs, '', ''],
        ['Participantes en PLCs', totalPLCParticipants, '', ''],
        ['', '', '', ''],
        ['REGISTROS MENSUALES (últimos 6 meses)', '', '', ''],
        ['Mes', 'Nuevos Miembros', '', ''],
        ...monthlyData.map(d => [d.label, d.count, '', '']),
      ];
      addSheet(wb, '📊 Resumen', resumeRows, [30, 20, 15, 15], 0);

      // === Sheet 2: Miembros completo ===
      const memberRows = [
        ['LISTADO COMPLETO DE MIEMBROS', '', '', '', '', '', '', '', ''],
        ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Estado', 'Fecha Nacimiento', 'Dirección', 'Grupo PLC', 'Fecha Registro'],
        ...members.map((m: any) => [
          m.first_name ?? '',
          m.last_name ?? '',
          m.email ?? '',
          m.phone ?? '',
          m.status === 'active' ? 'Activo' : 'Inactivo',
          m.birth_date ? format(new Date(m.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
          m.address ?? '',
          m.plcGroupId ?? '',
          m.created_at ? format(new Date(m.created_at), 'dd/MM/yyyy') : '',
        ]),
      ];
      addSheet(wb, '👥 Miembros', memberRows, [20, 20, 30, 16, 12, 18, 30, 15, 16]);

      // === Sheet 3: Activos ===
      const activeRows = [
        ['MIEMBROS ACTIVOS', '', '', '', '', ''],
        ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Fecha Nacimiento', 'Fecha Registro'],
        ...members
          .filter((m: any) => m.status === 'active')
          .map((m: any) => [
            m.first_name ?? '',
            m.last_name ?? '',
            m.email ?? '',
            m.phone ?? '',
            m.birth_date ? format(new Date(m.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
            m.created_at ? format(new Date(m.created_at), 'dd/MM/yyyy') : '',
          ]),
      ];
      addSheet(wb, '✅ Activos', activeRows, [20, 20, 30, 16, 18, 16]);

      // === Sheet 4: Crecimiento mensual ===
      const growthRows = [
        ['CRECIMIENTO MENSUAL — últimos 6 meses', '', ''],
        ['(Seleccione estos datos y use Insertar > Gráfico en Excel)', '', ''],
        ['', '', ''],
        ['Mes', 'Nuevos Registros', 'Total Acumulado'],
        ...monthlyData.reduce<[string, number, number][]>((acc, d, i) => {
          const prev = i === 0 ? 0 : acc[i - 1][2];
          acc.push([d.label, d.count, prev + d.count]);
          return acc;
        }, []),
      ];
      addSheet(wb, '📈 Crecimiento', growthRows, [20, 22, 20], 4);

      XLSX.writeFile(wb, `Informe_Miembros_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('✅ Informe de Miembros exportado correctamente');
    } catch (e) {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  }

  function exportBaptisms() {
    setExporting('baptisms');
    try {
      const wb = XLSX.utils.book_new();

      addSheet(wb, '📊 Resumen', [
        ['INFORME DE BAUTISMOS', '', ''],
        ['Generado el:', format(new Date(), "dd/MM/yyyy 'a las' HH:mm"), ''],
        ['', '', ''],
        ['Total de Registros', baptisms.length, ''],
        ['Completados', completedBaptisms, `${baptisms.length ? Math.round(completedBaptisms / baptisms.length * 100) : 0}%`],
        ['Agendados', scheduledBaptisms, `${baptisms.length ? Math.round(scheduledBaptisms / baptisms.length * 100) : 0}%`],
      ], [30, 20, 15], 0);

      addSheet(wb, '💧 Bautismos', [
        ['REGISTRO COMPLETO DE BAUTISMOS', '', '', '', ''],
        ['Nombre', 'Fecha Agendada', 'Lugar', 'Estado', 'Fecha Registro'],
        ...baptisms.map((b: any) => [
          b.full_name ?? '',
          b.scheduled_date ? format(new Date(b.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
          b.location ?? '',
          b.status === 'completed' ? 'Completado' : b.status === 'scheduled' ? 'Agendado' : b.status ?? '',
          b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [30, 18, 25, 15, 18]);

      addSheet(wb, '✅ Completados', [
        ['BAUTISMOS COMPLETADOS', '', '', ''],
        ['Nombre', 'Fecha', 'Lugar', 'Fecha Registro'],
        ...baptisms
          .filter((b: any) => b.status === 'completed')
          .map((b: any) => [
            b.full_name ?? '',
            b.scheduled_date ? format(new Date(b.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
            b.location ?? '',
            b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : '',
          ]),
      ], [30, 18, 25, 18]);

      addSheet(wb, '📅 Próximos', [
        ['BAUTISMOS PRÓXIMOS (AGENDADOS)', '', '', ''],
        ['Nombre', 'Fecha', 'Lugar', 'Fecha Registro'],
        ...baptisms
          .filter((b: any) => b.status === 'scheduled')
          .map((b: any) => [
            b.full_name ?? '',
            b.scheduled_date ? format(new Date(b.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
            b.location ?? '',
            b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : '',
          ]),
      ], [30, 18, 25, 18]);

      XLSX.writeFile(wb, `Informe_Bautismos_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('✅ Informe de Bautismos exportado correctamente');
    } catch (e) {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  }

  function exportPLC() {
    setExporting('plc');
    try {
      const wb = XLSX.utils.book_new();

      addSheet(wb, '📊 Resumen', [
        ['INFORME DE PLCs', '', ''],
        ['Generado el:', format(new Date(), "dd/MM/yyyy 'a las' HH:mm"), ''],
        ['', '', ''],
        ['Total de Grupos', plcGroups.length, ''],
        ['Grupos Activos', activePLCs, `${plcGroups.length ? Math.round(activePLCs / plcGroups.length * 100) : 0}%`],
        ['Total Participantes', totalPLCParticipants, ''],
        ['Promedio por grupo', plcGroups.length ? Math.round(totalPLCParticipants / plcGroups.length) : 0, ''],
      ], [30, 20, 15], 0);

      addSheet(wb, '🏘️ Grupos', [
        ['GRUPOS PLC', '', '', '', ''],
        ['Nombre del Grupo', 'Líder', 'Día de Reunión', 'Estado', 'Participantes'],
        ...plcGroups.map(g => [
          g.name ?? '',
          g.leaderId ?? '',
          (g as any).meetingDay ?? '',
          g.isActive ? 'Activo' : 'Inactivo',
          g.members?.length ?? 0,
        ]),
      ], [30, 25, 20, 12, 15]);

      addSheet(wb, '📈 Datos Gráfico', [
        ['DATOS PARA GRÁFICO — PLCs'],
        ['(Seleccione y use Insertar > Gráfico en Excel)'],
        [''],
        ['Estado', 'Cantidad'],
        ['Activos', activePLCs],
        ['Inactivos', plcGroups.length - activePLCs],
        [''],
        ['Participantes por Grupo'],
        ['Grupo', 'Participantes'],
        ...plcGroups.map(g => [g.name ?? 'Sin nombre', g.members?.length ?? 0]),
      ], [30, 20], 0);

      XLSX.writeFile(wb, `Informe_PLCs_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('✅ Informe de PLCs exportado correctamente');
    } catch (e) {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  }

  function exportLeaders() {
    setExporting('leaders');
    try {
      const wb = XLSX.utils.book_new();

      addSheet(wb, '🎯 Líderes', [
        ['LISTADO DE LÍDERES / MAESTROS', '', '', '', ''],
        ['Nombre', 'Email', 'Teléfono', 'Cargo', 'Fecha Registro'],
        ...leaders.map((l: any) => [
          l.name ?? '',
          l.email ?? '',
          l.phone ?? '',
          Array.isArray(l.cargo) ? l.cargo.join(', ') : (l.cargo ?? ''),
          l.created_at ? format(new Date(l.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [30, 30, 18, 30, 16]);

      XLSX.writeFile(wb, `Informe_Lideres_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('✅ Informe de Líderes exportado correctamente');
    } catch (e) {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  }

  /* ── EXPORTACIÓN COMPLETA (todos los módulos en un archivo) ── */
  async function exportAll() {
    setExporting('all');
    try {
      const wb = XLSX.utils.book_new();

      // === PORTADA ===
      addSheet(wb, '🏠 Portada', [
        ['INFORME GENERAL — NUEVOS HECHOS'],
        [''],
        ['Fecha de generación:', format(new Date(), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })],
        [''],
        ['CONTENIDO DEL INFORME'],
        ['Hoja', 'Descripción'],
        ['📊 Resumen Ejecutivo', 'Estadísticas clave de toda la iglesia'],
        ['👥 Miembros', 'Lista completa de todos los miembros'],
        ['✅ Miembros Activos', 'Solo miembros con estado activo'],
        ['💧 Bautismos', 'Registro completo de bautismos'],
        ['🏘️ PLCs', 'Grupos de PLC con participantes'],
        ['🎯 Líderes', 'Listado de líderes y maestros'],
        ['📈 Crecimiento', 'Registros mensuales (últimos 6 meses)'],
        ['📊 Datos Gráficos', 'Datos listos para generar gráficos en Excel'],
      ], [35, 45], 0);

      // === RESUMEN EJECUTIVO ===
      addSheet(wb, '📊 Resumen Ejecutivo', [
        ['RESUMEN EJECUTIVO — NUEVOS HECHOS', '', '', ''],
        ['', '', '', ''],
        ['MÓDULO DE MIEMBROS', '', '', ''],
        ['Indicador', 'Valor', 'Porcentaje', 'Estado'],
        ['Total de Miembros', totalMembers, '100%', ''],
        ['Miembros Activos', activeMembers, `${activePct}%`, activePct >= 70 ? 'BIEN' : 'ATENCIÓN'],
        ['Miembros Inactivos', inactiveMembers, `${100 - activePct}%`, ''],
        ['', '', '', ''],
        ['MÓDULO DE BAUTISMOS', '', '', ''],
        ['Indicador', 'Valor', 'Porcentaje', ''],
        ['Total Registros', baptisms.length, '100%', ''],
        ['Completados', completedBaptisms, baptisms.length ? `${Math.round(completedBaptisms / baptisms.length * 100)}%` : '0%', ''],
        ['Agendados', scheduledBaptisms, baptisms.length ? `${Math.round(scheduledBaptisms / baptisms.length * 100)}%` : '0%', ''],
        ['', '', '', ''],
        ['MÓDULO DE PLCs', '', '', ''],
        ['Indicador', 'Valor', '', ''],
        ['Total de Grupos', plcGroups.length, '', ''],
        ['Grupos Activos', activePLCs, '', ''],
        ['Total Participantes', totalPLCParticipants, '', ''],
        ['Promedio de Participantes por Grupo', plcGroups.length ? Math.round(totalPLCParticipants / plcGroups.length) : 0, '', ''],
        ['', '', '', ''],
        ['MÓDULO DE LÍDERES', '', '', ''],
        ['Total de Líderes registrados', leaders.length, '', ''],
      ], [40, 20, 15, 15], 0);

      // === MIEMBROS ===
      addSheet(wb, '👥 Miembros', [
        ['LISTADO COMPLETO DE MIEMBROS', '', '', '', '', '', '', '', ''],
        ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Estado', 'Fecha Nacimiento', 'Dirección', 'Grupo PLC', 'Fecha Registro'],
        ...members.map((m: any) => [
          m.first_name ?? '',
          m.last_name ?? '',
          m.email ?? '',
          m.phone ?? '',
          m.status === 'active' ? 'Activo' : 'Inactivo',
          m.birth_date ? format(new Date(m.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
          m.address ?? '',
          m.plcGroupId ?? '',
          m.created_at ? format(new Date(m.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [20, 20, 30, 16, 12, 18, 30, 15, 16]);

      // === ACTIVOS ===
      addSheet(wb, '✅ Activos', [
        ['MIEMBROS ACTIVOS', '', '', '', '', ''],
        ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Fecha Nacimiento', 'Fecha Registro'],
        ...members.filter((m: any) => m.status === 'active').map((m: any) => [
          m.first_name ?? '',
          m.last_name ?? '',
          m.email ?? '',
          m.phone ?? '',
          m.birth_date ? format(new Date(m.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
          m.created_at ? format(new Date(m.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [20, 20, 30, 16, 18, 16]);

      // === BAUTISMOS ===
      addSheet(wb, '💧 Bautismos', [
        ['REGISTRO COMPLETO DE BAUTISMOS', '', '', '', ''],
        ['Nombre', 'Fecha Agendada', 'Lugar', 'Estado', 'Fecha Registro'],
        ...baptisms.map((b: any) => [
          b.full_name ?? '',
          b.scheduled_date ? format(new Date(b.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
          b.location ?? '',
          b.status === 'completed' ? 'Completado' : b.status === 'scheduled' ? 'Agendado' : b.status ?? '',
          b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [30, 18, 25, 15, 18]);

      // === PLCs ===
      addSheet(wb, '🏘️ PLCs', [
        ['GRUPOS PLC', '', '', '', ''],
        ['Nombre del Grupo', 'Líder ID', 'Día de Reunión', 'Estado', 'Participantes'],
        ...plcGroups.map(g => [
          g.name ?? '',
          g.leaderId ?? '',
          (g as any).meetingDay ?? '',
          g.isActive ? 'Activo' : 'Inactivo',
          g.members?.length ?? 0,
        ]),
      ], [30, 25, 20, 12, 15]);

      // === LÍDERES ===
      addSheet(wb, '🎯 Líderes', [
        ['LISTADO DE LÍDERES', '', '', '', ''],
        ['Nombre', 'Email', 'Teléfono', 'Cargo / Curso a Impartir', 'Fecha Registro'],
        ...leaders.map((l: any) => [
          l.name ?? '',
          l.email ?? '',
          l.phone ?? '',
          Array.isArray(l.cargo) ? l.cargo.join(', ') : (l.cargo ?? ''),
          l.created_at ? format(new Date(l.created_at), 'dd/MM/yyyy') : '',
        ]),
      ], [30, 30, 18, 40, 16]);

      // === CRECIMIENTO MENSUAL ===
      addSheet(wb, '📈 Crecimiento', [
        ['CRECIMIENTO MENSUAL — NUEVOS REGISTROS'],
        ['Datos de los últimos 6 meses'],
        ['TIP: Seleccione las filas de datos y use Insertar > Gráfico de columnas en Excel'],
        [''],
        ['Mes', 'Nuevos Registros', 'Total Acumulado', '% Cambio'],
        ...monthlyData.reduce<[string, number, number, string][]>((acc, d, i) => {
          const prev = i === 0 ? 0 : acc[i - 1][2];
          const prevCount = i === 0 ? 0 : acc[i - 1][1];
          const pct = prevCount === 0 ? '' : `${d.count >= prevCount ? '+' : ''}${Math.round((d.count - prevCount) / (prevCount || 1) * 100)}%`;
          acc.push([d.label, d.count, prev + d.count, pct]);
          return acc;
        }, []),
      ], [18, 20, 20, 15], 5);

      // === DATOS PARA GRÁFICOS ===
      addSheet(wb, '📊 Datos Gráficos', [
        ['DATOS LISTOS PARA CREAR GRÁFICOS EN EXCEL'],
        ['Seleccione cada tabla y use Insertar > Gráfico'],
        [''],
        ['── MIEMBROS POR ESTADO ──', ''],
        ['Estado', 'Cantidad'],
        ['Activos', activeMembers],
        ['Inactivos', inactiveMembers],
        [''],
        ['── BAUTISMOS POR ESTADO ──', ''],
        ['Estado', 'Cantidad'],
        ['Completados', completedBaptisms],
        ['Agendados', scheduledBaptisms],
        [''],
        ['── NUEVOS REGISTROS MENSUALES ──', ''],
        ['Mes', 'Nuevos Miembros'],
        ...monthlyData.map(d => [d.label, d.count]),
        [''],
        ['── PLCs POR ESTADO ──', ''],
        ['Estado', 'Cantidad'],
        ['Activos', activePLCs],
        ['Inactivos', plcGroups.length - activePLCs],
        [''],
        ['── PARTICIPANTES POR GRUPO PLC ──', ''],
        ['Grupo', 'Participantes'],
        ...plcGroups.map(g => [g.name ?? 'Sin nombre', g.members?.length ?? 0]),
      ], [35, 20], 0);

      XLSX.writeFile(wb, `Informe_Completo_NuevosHechos_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('✅ Informe Completo exportado — ¡Revise su carpeta de Descargas!');
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar el informe completo');
    } finally {
      setExporting(null);
    }
  }

  /* ─────────────────── UI ─────────────────── */
  const modules = [
    {
      id: 'members',
      title: 'Miembros',
      description: 'Lista completa, activos, inactivos y crecimiento mensual',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      stat: `${totalMembers} registros`,
      sheets: ['Resumen', 'Miembros', 'Activos', 'Crecimiento'],
      onExport: exportMembers,
    },
    {
      id: 'baptisms',
      title: 'Bautismos',
      description: 'Todos los bautismos, completados y próximos agendados',
      icon: Droplets,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      stat: `${baptisms.length} registros`,
      sheets: ['Resumen', 'Todos', 'Completados', 'Próximos'],
      onExport: exportBaptisms,
    },
    {
      id: 'plc',
      title: 'PLCs',
      description: 'Grupos activos, participantes y datos para gráficos',
      icon: HandHeart,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      stat: `${plcGroups.length} grupos`,
      sheets: ['Resumen', 'Grupos', 'Datos Gráficos'],
      onExport: exportPLC,
    },
    {
      id: 'leaders',
      title: 'Líderes',
      description: 'Listado de líderes y maestros con cargos asignados',
      icon: Award,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      stat: `${leaders.length} líderes`,
      sheets: ['Líderes'],
      onExport: exportLeaders,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Informes y Exportación</h1>
              <p className="text-muted-foreground">Exporte datos reales a Excel con estadísticas y gráficos</p>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            onClick={exportAll}
            disabled={!!exporting || isLoading}
          >
            {exporting === 'all' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
            ) : (
              <><FileSpreadsheet className="w-5 h-5" /> Exportar Todo</>
            )}
          </Button>
        </div>

        {/* Loading bar */}
        {isLoading && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Cargando datos del sistema...</p>
                <Progress value={65} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Miembros', value: totalMembers, sub: `${activePct}% activos`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Bautismos', value: baptisms.length, sub: `${completedBaptisms} completados`, icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { label: 'PLCs Activos', value: activePLCs, sub: `${totalPLCParticipants} participantes`, icon: HandHeart, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Líderes', value: leaders.length, sub: 'Registrados', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg} shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? '…' : s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground/60">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly growth mini chart */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Nuevos Miembros — Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {monthlyData.map((d, i) => {
                const max = Math.max(...monthlyData.map(x => x.count), 1);
                const h = d.count === 0 ? 4 : Math.round((d.count / max) * 80);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-foreground">{d.count}</span>
                    <div
                      className="w-full rounded-t-md bg-primary/70 transition-all duration-500"
                      style={{ height: `${h}px` }}
                    />
                    <span className="text-xs text-muted-foreground capitalize">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Module export cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Exportar por Módulo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((m, i) => (
              <Card
                key={m.id}
                className="hover:shadow-soft transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${m.bg}`}>
                        <m.icon className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{m.title}</h3>
                        <p className="text-xs text-muted-foreground">{m.stat}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {m.sheets.length} hoja{m.sheets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{m.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {m.sheets.map(s => (
                      <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        📋 {s}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={m.onExport}
                    disabled={!!exporting || isLoading}
                  >
                    {exporting === m.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Generando Excel...</>
                    ) : (
                      <><FileSpreadsheet className="w-4 h-4" />Exportar Excel</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Card className="border-amber-500/30 bg-amber-500/5 animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Como crear gráficos en Excel</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Abra el archivo exportado en Excel</li>
                  <li>Vaya a la hoja <strong className="text-foreground">📊 Datos Gráficos</strong></li>
                  <li>Seleccione una tabla de datos (ej: "MIEMBROS POR ESTADO")</li>
                  <li>Haga clic en <strong className="text-foreground">Insertar → Gráfico</strong></li>
                  <li>Elija el tipo: Columnas, Circular (pastel), Barras, etc.</li>
                  <li>¡Listo! El gráfico se crea automáticamente con sus datos reales</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}