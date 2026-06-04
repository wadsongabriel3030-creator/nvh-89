import { supabase } from '@/integrations/supabase/client';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';

export interface ClassReportInput {
  area: string;
  leccion?: string | null;
  reportDate?: Date | null;
  leaderName?: string | null;
  attendeeIds?: string[];
  attendeeNames?: string[];
  extra?: Record<string, unknown> | null;
}

export interface ClassReportRow {
  id: string;
  area: string;
  leccion: string | null;
  report_date: string | null;
  leader_name: string | null;
  attendee_ids: string[];
  attendee_names: string[];
  extra: Record<string, unknown> | null;
}

/** Guarda un reporte de clase en el banco de datos (tabla class_reports). */
export async function saveClassReport(input: ClassReportInput) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('class_reports').insert({
    area: input.area,
    leccion: input.leccion ?? null,
    report_date: input.reportDate ? input.reportDate.toISOString().slice(0, 10) : null,
    leader_name: input.leaderName ?? null,
    attendee_ids: (input.attendeeIds ?? []) as never,
    attendee_names: (input.attendeeNames ?? []) as never,
    extra: (input.extra ?? null) as never,
    created_by: userData.user?.id ?? null,
  } as never);
  if (error) throw error;
  notifyMemberProgressUpdated();
}

/** Carga todos los reportes de clase del banco de datos. */
export async function fetchClassReports(): Promise<ClassReportRow[]> {
  const { data, error } = await supabase
    .from('class_reports')
    .select('id, area, leccion, report_date, leader_name, attendee_ids, attendee_names, extra');
  if (error) return [];
  return (data ?? []) as ClassReportRow[];
}
