import { supabase } from '@/integrations/supabase/client';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';

export interface PlcReportInput {
  plcGroupId: string;
  plcName: string;
  leaderId?: string | null;
  leaderName?: string | null;
  reportDate?: Date | null;
  meetingDay?: string | null;
  attendeeIds: string[];
  attendeeNames: string[];
  expectedMemberIds: string[];
  cantidadInvitados?: string | null;
  nombresInvitados?: string | null;
  huboConvertidos?: boolean | null;
  convertidosInfo?: string | null;
  huboReconciliados?: boolean | null;
  reconciliadosInfo?: string | null;
  huboIncorporados?: boolean | null;
  incorporadosInfo?: string | null;
  testimonioMilagros?: string | null;
  ofrendaRecolectada?: string | null;
  numeroCheque?: string | null;
  todosRecibieronAnuncios?: boolean | null;
  comentarios?: string | null;
}

export interface PlcReportRow {
  id: string;
  plc_group_id: string;
  plc_name: string;
  leader_id: string | null;
  leader_name: string | null;
  report_date: string | null;
  meeting_day: string | null;
  attendee_ids: string[];
  attendee_names: string[];
  expected_member_ids: string[];
  cantidad_invitados: string | null;
  nombres_invitados: string | null;
  hubo_convertidos: boolean | null;
  convertidos_info: string | null;
  hubo_reconciliados: boolean | null;
  reconciliados_info: string | null;
  hubo_incorporados: boolean | null;
  incorporados_info: string | null;
  testimonio_milagros: string | null;
  ofrenda_recolectada: string | null;
  numero_cheque: string | null;
  todos_recibieron_anuncios: boolean | null;
  comentarios: string | null;
  created_at: string;
  created_by: string | null;
}

export function getAbsentMemberIds(report: PlcReportRow): string[] {
  const attended = new Set((report.attendee_ids ?? []).map(String));
  return (report.expected_member_ids ?? [])
    .map(String)
    .filter((id) => !attended.has(id));
}

export async function savePlcReport(input: PlcReportInput): Promise<PlcReportRow> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('plc_reports')
    .insert({
      plc_group_id: input.plcGroupId,
      plc_name: input.plcName,
      leader_id: input.leaderId ?? null,
      leader_name: input.leaderName ?? null,
      report_date: input.reportDate ? input.reportDate.toISOString().slice(0, 10) : null,
      meeting_day: input.meetingDay ?? null,
      attendee_ids: input.attendeeIds as never,
      attendee_names: input.attendeeNames as never,
      expected_member_ids: input.expectedMemberIds as never,
      cantidad_invitados: input.cantidadInvitados ?? null,
      nombres_invitados: input.nombresInvitados ?? null,
      hubo_convertidos: input.huboConvertidos ?? null,
      convertidos_info: input.convertidosInfo ?? null,
      hubo_reconciliados: input.huboReconciliados ?? null,
      reconciliados_info: input.reconciliadosInfo ?? null,
      hubo_incorporados: input.huboIncorporados ?? null,
      incorporados_info: input.incorporadosInfo ?? null,
      testimonio_milagros: input.testimonioMilagros ?? null,
      ofrenda_recolectada: input.ofrendaRecolectada ?? null,
      numero_cheque: input.numeroCheque ?? null,
      todos_recibieron_anuncios: input.todosRecibieronAnuncios ?? null,
      comentarios: input.comentarios ?? null,
      created_by: userData.user?.id ?? null,
    } as never)
    .select()
    .single();

  if (error) throw error;
  notifyMemberProgressUpdated();
  return data as PlcReportRow;
}

export async function fetchPlcReports(): Promise<PlcReportRow[]> {
  const { data, error } = await supabase
    .from('plc_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []) as PlcReportRow[];
}

export async function deletePlcReport(id: string): Promise<boolean> {
  const { error } = await supabase.from('plc_reports').delete().eq('id', id);
  if (error) return false;
  notifyMemberProgressUpdated();
  return true;
}
