import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Filter,
  HandHeart,
  Search,
  UserX,
  Users,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useMembers } from '@/contexts/MembersContext';
import { PLCGroup } from '@/types';
import {
  fetchPlcReports,
  getAbsentMemberIds,
  type PlcReportRow,
} from '@/lib/plcReports';
import { MEMBER_PROGRESS_EVENT } from '@/lib/memberProgressEvents';

export default function ResumenPLC() {
  const navigate = useNavigate();
  const { members } = useMembers();
  const { value: plcGroups } = useDbStorage<PLCGroup[]>('plc_groups_list', []);
  const [reports, setReports] = useState<PlcReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlc, setFilterPlc] = useState<string>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [alertOnly, setAlertOnly] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    const data = await fetchPlcReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
    const refresh = () => loadReports();
    window.addEventListener(MEMBER_PROGRESS_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(MEMBER_PROGRESS_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const memberName = (id: string) => {
    const m = members.find((x) => x.id === id);
    return m ? `${m.firstName} ${m.lastName}`.trim() : id;
  };

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (filterPlc !== 'all' && r.plc_group_id !== filterPlc) return false;

      const absentIds = getAbsentMemberIds(r);
      if (filterMember !== 'all') {
        const attended = (r.attendee_ids ?? []).map(String).includes(filterMember);
        const absent = absentIds.includes(filterMember);
        const expected = (r.expected_member_ids ?? []).map(String).includes(filterMember);
        if (!attended && !absent && !expected) return false;
      }

      if (alertOnly && absentIds.length === 0) return false;

      if (q) {
        const hay = [
          r.plc_name,
          r.leader_name,
          r.meeting_day,
          r.comentarios,
          ...(r.attendee_names ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [reports, filterPlc, filterMember, search, alertOnly]);

  const totalAlerts = useMemo(
    () => filteredReports.reduce((acc, r) => acc + getAbsentMemberIds(r).length, 0),
    [filteredReports]
  );

  const memberStats = useMemo(() => {
    const stats: Record<
      string,
      { attended: number; absent: number; reports: number }
    > = {};
    for (const r of reports) {
      const absent = new Set(getAbsentMemberIds(r));
      for (const id of r.expected_member_ids ?? []) {
        const sid = String(id);
        if (!stats[sid]) stats[sid] = { attended: 0, absent: 0, reports: 0 };
        stats[sid].reports += 1;
        if (absent.has(sid)) stats[sid].absent += 1;
        else stats[sid].attended += 1;
      }
    }
    return stats;
  }, [reports]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/plc')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-success/10">
              <ClipboardList className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Resumen PLC</h1>
              <p className="text-sm text-muted-foreground">
                Todos los reportes enviados desde /reporte-plc
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/plc')} className="gap-2">
            <HandHeart className="w-4 h-4" />
            Volver a PLCs
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <ClipboardList className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filteredReports.length}</p>
                <p className="text-sm text-muted-foreground">Reportes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Users className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{plcGroups.length}</p>
                <p className="text-sm text-muted-foreground">PLCs registrados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{totalAlerts}</p>
                <p className="text-sm text-muted-foreground">Ausencias (filtro actual)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
            <CardDescription>Filtrar por PLC, miembro o buscar texto</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">PLC</label>
              <Select value={filterPlc} onValueChange={setFilterPlc}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los PLCs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los PLCs</SelectItem>
                  {plcGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Miembro</label>
              <Select value={filterMember} onValueChange={setFilterMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los miembros" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Todos los miembros</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-muted-foreground">Buscar</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="PLC, líder, comentarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Button
                variant={alertOnly ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setAlertOnly((v) => !v)}
              >
                <UserX className="w-4 h-4" />
                Solo reportes con ausencias
              </Button>
            </div>
          </CardContent>
        </Card>

        {filterMember !== 'all' && memberStats[filterMember] && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">Control del miembro</CardTitle>
              <CardDescription>{memberName(filterMember)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge variant="secondary">
                {memberStats[filterMember].reports} reporte(s) del PLC
              </Badge>
              <Badge className="bg-success/15 text-success border-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Asistió: {memberStats[filterMember].attended}
              </Badge>
              <Badge variant="destructive">
                <UserX className="w-3 h-3 mr-1" />
                Ausente: {memberStats[filterMember].absent}
              </Badge>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="p-12 text-center text-muted-foreground">Cargando reportes...</Card>
        ) : filteredReports.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No hay reportes PLC con estos filtros.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate('/plc')}>
              Ir a PLCs y enviar reporte
            </Button>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {filteredReports.map((report) => {
              const absentIds = getAbsentMemberIds(report);
              const submittedAt = format(new Date(report.created_at), "EEEE d 'de' MMMM yyyy, HH:mm:ss", {
                locale: es,
              });
              const meetingDate = report.report_date
                ? format(new Date(report.report_date + 'T12:00:00'), 'PPP', { locale: es })
                : '—';

              return (
                <AccordionItem
                  key={report.id}
                  value={report.id}
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{report.plc_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Enviado: {submittedAt}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{meetingDate}</Badge>
                        {report.meeting_day && (
                          <Badge variant="secondary">{report.meeting_day}</Badge>
                        )}
                        <Badge className="bg-success/10 text-success border-0">
                          {(report.attendee_ids ?? []).length} asistieron
                        </Badge>
                        {absentIds.length > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {absentIds.length} ausente(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Líder</p>
                        <p className="font-medium">{report.leader_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ofrenda</p>
                        <p className="font-medium">{report.ofrenda_recolectada ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Invitados</p>
                        <p className="font-medium">
                          {report.cantidad_invitados ?? '0'}
                          {report.nombres_invitados ? ` — ${report.nombres_invitados}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Anuncios recibidos</p>
                        <p className="font-medium">
                          {report.todos_recibieron_anuncios === true
                            ? 'Sí'
                            : report.todos_recibieron_anuncios === false
                              ? 'No'
                              : '—'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Asistieron ({(report.attendee_ids ?? []).length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(report.attendee_ids ?? []).map((id) => (
                          <Badge key={id} variant="secondary">
                            {memberName(String(id))}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {absentIds.length > 0 && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                        <p className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Alerta — No asistieron ({absentIds.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {absentIds.map((id) => (
                            <Badge key={id} variant="destructive">
                              <UserX className="w-3 h-3 mr-1" />
                              {memberName(id)}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Estos miembros estaban en el PLC pero no fueron marcados en el paso 3
                          del reporte.
                        </p>
                      </div>
                    )}

                    {(report.hubo_convertidos ||
                      report.hubo_reconciliados ||
                      report.hubo_incorporados) && (
                      <div className="text-sm space-y-1">
                        {report.hubo_convertidos && (
                          <p>
                            <span className="font-medium">Convertidos:</span>{' '}
                            {report.convertidos_info || 'Sí'}
                          </p>
                        )}
                        {report.hubo_reconciliados && (
                          <p>
                            <span className="font-medium">Reconciliados:</span>{' '}
                            {report.reconciliados_info || 'Sí'}
                          </p>
                        )}
                        {report.hubo_incorporados && (
                          <p>
                            <span className="font-medium">Incorporados:</span>{' '}
                            {report.incorporados_info || 'Sí'}
                          </p>
                        )}
                      </div>
                    )}

                    {report.testimonio_milagros && (
                      <div>
                        <p className="text-sm font-medium">Testimonio</p>
                        <p className="text-sm text-muted-foreground">{report.testimonio_milagros}</p>
                      </div>
                    )}

                    {report.comentarios && (
                      <div>
                        <p className="text-sm font-medium">Comentarios</p>
                        <p className="text-sm text-muted-foreground">{report.comentarios}</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/reporte-plc?plc=${report.plc_group_id}`)}
                    >
                      Nuevo reporte para este PLC
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </MainLayout>
  );
}
