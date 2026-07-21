import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles, Plus, Users, CheckCircle, Clock, FileText, BookOpen, ClipboardList, Heart, Calendar, Phone, MessageSquare, User, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useMembers } from '@/contexts/MembersContext';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';
import { fetchClassReports, deleteClassReport, type ClassReportRow } from '@/lib/classReports';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const CURSO_MEMBRESIA = {
  id: 'membresia',
  nombre: 'Vida Nuevos Hechos',
  descripcion: 'Curso de membresía para nuevos integrantes de la iglesia',
  totalLabel: '1 LECCIÓN',
  color: 'text-primary',
  lecciones: ['Vida Nuevos Hechos'],
};
import { NuevosComienzosParticipant } from '@/types';
import { ParticipantCard } from '@/components/nuevos-comienzos/ParticipantCard';
import { AddParticipantDialog } from '@/components/nuevos-comienzos/AddParticipantDialog';
import { EditParticipantDialog } from '@/components/nuevos-comienzos/EditParticipantDialog';
import { DeleteParticipantDialog } from '@/components/nuevos-comienzos/DeleteParticipantDialog';

const initialParticipants: NuevosComienzosParticipant[] = [
  { id: '1', memberId: '4', startDate: '2024-01-15', status: 'in_progress' },
  { id: '2', memberId: '5', startDate: '2024-01-08', completionDate: '2024-02-08', status: 'completed' },
];

export default function NuevosComienzos() {
  const navigate = useNavigate();
  const { members } = useMembers();
  const { value: participants, setValue: setParticipants } = useDbStorage<NuevosComienzosParticipant[]>(
    'membresia-participants-v1',
    initialParticipants,
    'membresia'
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<NuevosComienzosParticipant | null>(null);
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'inscripcion-vida-nuevos' | 'compromiso-vnh' | 'membresia'>('all');
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    try {
      await deleteClassReport(deleteReportId);
      setAllReports(prev => prev.filter(r => r.id !== deleteReportId));
      toast.success('Reporte eliminado con éxito');
    } catch {
      toast.error('No se pudo eliminar el reporte');
    }
    setDeleteReportId(null);
  };

  // Fetch reports
  const [allReports, setAllReports] = useState<ClassReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const filteredReports = reportFilter === 'all'
    ? allReports
    : allReports.filter((r) => r.area === reportFilter);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingReports(true);
      const reports = await fetchClassReports();
      if (!active) return;
      // Filter only inscription, compromiso, and membresia reports
      const filtered = reports.filter(
        (r) =>
          r.area === 'inscripcion-vida-nuevos' ||
          r.area === 'compromiso-vnh' ||
          r.area === 'membresia'
      );
      // Sort by created_at (most recent first), fallback to report_date
      filtered.sort((a, b) => {
        const dateA = a.report_date || '';
        const dateB = b.report_date || '';
        return dateB.localeCompare(dateA);
      });
      setAllReports(filtered);
      setLoadingReports(false);
    })();
    return () => { active = false; };
  }, []);

  const getMember = (memberId: string) => members.find(m => m.id === memberId);

  const handleAdd = (participant: NuevosComienzosParticipant) => {
    setParticipants(prev => [...prev, participant]);
    notifyMemberProgressUpdated();
  };

  const handleEdit = (updated: NuevosComienzosParticipant) => {
    setParticipants(prev => prev.map(p => p.id === updated.id ? updated : p));
    notifyMemberProgressUpdated();
  };

  const handleDelete = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    notifyMemberProgressUpdated();
  };

  const openEditDialog = (participant: NuevosComienzosParticipant) => {
    setSelectedParticipant(participant);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (participant: NuevosComienzosParticipant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };

  const inProgressCount = participants.filter(p => p.status === 'in_progress').length;
  const completedCount = participants.filter(p => p.status === 'completed').length;

  const getReportTypeBadge = (area: string) => {
    switch (area) {
      case 'inscripcion-vida-nuevos':
        return (
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
            <ClipboardList className="w-3 h-3 mr-1" />
            Inscripción
          </Badge>
        );
      case 'compromiso-vnh':
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
            <Heart className="w-3 h-3 mr-1" />
            Compromiso
          </Badge>
        );
      case 'membresia':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
            <FileText className="w-3 h-3 mr-1" />
            Reporte de Clase
          </Badge>
        );
      default:
        return <Badge variant="secondary">{area}</Badge>;
    }
  };

  const renderReportCard = (report: ClassReportRow) => {
    const extra = (report.extra || {}) as Record<string, unknown>;
    const reportDate = report.report_date
      ? format(new Date(report.report_date + 'T12:00:00'), 'PPP', { locale: es })
      : 'Sin fecha';

    if (report.area === 'inscripcion-vida-nuevos') {
      return (
        <Card key={report.id} className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {getReportTypeBadge(report.area)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {reportDate}
                </span>
                <button
                  onClick={() => setDeleteReportId(report.id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Eliminar reporte"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nombre Completo</p>
                  <p className="text-sm font-medium text-foreground">{report.leader_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium text-foreground">{(extra.telefono as string) || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Asistencia Confirmada</p>
                  <p className="text-sm font-medium text-foreground">
                    {(extra.asistencia as string) === 'si' ? 'Sí podré asistir' : (extra.asistencia as string) === 'no' ? 'No podré asistir' : '—'}
                  </p>
                </div>
              </div>
              {extra.comentarios && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Comentarios</p>
                    <p className="text-sm text-foreground">{extra.comentarios as string}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (report.area === 'compromiso-vnh') {
      return (
        <Card key={report.id} className="border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {getReportTypeBadge(report.area)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {reportDate}
                </span>
                <button
                  onClick={() => setDeleteReportId(report.id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Eliminar reporte"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="text-sm font-medium text-foreground">{(extra.nombre as string) || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Apellido</p>
                  <p className="text-sm font-medium text-foreground">{(extra.apellido as string) || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <Heart className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Compromisos</p>
                  <ul className="text-sm text-foreground space-y-0.5">
                    <li className="flex items-center gap-1.5">
                      {extra.leidoFamilia ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Se hizo parte de la familia Nuevos Hechos</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {extra.compromiso1 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Ser fiel, congregarse regularmente</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {extra.compromiso2 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Ser parte activa de un PLC</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {extra.compromiso3 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Crecer espiritualmente (Ruta del Discípulo)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Reporte de clase (membresia)
    return (
      <Card key={report.id} className="border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {getReportTypeBadge(report.area)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {reportDate}
              </span>
              <button
                onClick={() => setDeleteReportId(report.id)}
                className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Eliminar reporte"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Impartido por</p>
                <p className="text-sm font-medium text-foreground">{report.leader_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Lección</p>
                <p className="text-sm font-medium text-foreground">{report.leccion || '—'}</p>
              </div>
            </div>
            {report.attendee_names && report.attendee_names.length > 0 && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Asistentes ({report.attendee_names.length})</p>
                  <p className="text-sm text-foreground">{report.attendee_names.join(', ')}</p>
                </div>
              </div>
            )}
            {extra.invitados && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Invitados</p>
                  <p className="text-sm text-foreground">{extra.invitados as string}</p>
                </div>
              </div>
            )}
            {extra.decisiones && (
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Decisiones / Testimonios</p>
                  <p className="text-sm text-foreground">{extra.decisiones as string}</p>
                </div>
              </div>
            )}
            {extra.observaciones && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm text-foreground">{extra.observaciones as string}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vida Nuevos Hechos</h1>
              <p className="text-muted-foreground">Acompaña a los nuevos convertidos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Agregar Participante
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open('/inscripcion-vida-nuevos', '_blank')}>
              <Sparkles className="w-4 h-4" />
              INSCRÍBETE
            </Button>
            <Button variant="outline" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10" onClick={() => window.open('/compromiso-vnh', '_blank')}>
              <CheckCircle className="w-4 h-4" />
              Compromiso VNH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{participants.length}</p>
                <p className="text-sm text-muted-foreground">Total de participantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">En progreso</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Curso card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg bg-muted text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {CURSO_MEMBRESIA.totalLabel}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-3">{CURSO_MEMBRESIA.nombre}</CardTitle>
              <CardDescription>{CURSO_MEMBRESIA.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lecciones
                </p>
                <ul className="space-y-1">
                  {CURSO_MEMBRESIA.lecciones.map((l) => (
                    <li key={l} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => navigate('/reporte-membresia')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Reporte
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Reportes</h2>
                <p className="text-sm text-muted-foreground">Inscripciones, Compromisos y Reportes de Clase</p>
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              size="sm"
              variant={reportFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setReportFilter('all')}
              className="gap-1.5"
            >
              Todos ({allReports.length})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === 'inscripcion-vida-nuevos' ? 'default' : 'outline'}
              onClick={() => setReportFilter('inscripcion-vida-nuevos')}
              className="gap-1.5 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Inscripción ({allReports.filter(r => r.area === 'inscripcion-vida-nuevos').length})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === 'compromiso-vnh' ? 'default' : 'outline'}
              onClick={() => setReportFilter('compromiso-vnh')}
              className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Heart className="w-3.5 h-3.5" />
              Compromiso ({allReports.filter(r => r.area === 'compromiso-vnh').length})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === 'membresia' ? 'default' : 'outline'}
              onClick={() => setReportFilter('membresia')}
              className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <FileText className="w-3.5 h-3.5" />
              Reporte de Clase ({allReports.filter(r => r.area === 'membresia').length})
            </Button>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {reportFilter === 'all'
                    ? 'No hay reportes registrados aún'
                    : `No hay reportes de tipo "${reportFilter === 'inscripcion-vida-nuevos' ? 'Inscripción' : reportFilter === 'compromiso-vnh' ? 'Compromiso' : 'Reporte de Clase'}" aún`}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">Los reportes aparecerán aquí cuando se envíen inscripciones, compromisos o reportes de clase.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredReports.map((report) => renderReportCard(report))}
            </div>
          )}
        </div>

      </div>

      <AddParticipantDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
        members={members}
        existingParticipantIds={participants.map(p => p.memberId)}
      />
      <EditParticipantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEdit={handleEdit}
        participant={selectedParticipant}
      />
      <DeleteParticipantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        participant={selectedParticipant}
        member={selectedParticipant ? getMember(selectedParticipant.memberId) : undefined}
      />
      <AlertDialog open={!!deleteReportId} onOpenChange={(o) => !o && setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

