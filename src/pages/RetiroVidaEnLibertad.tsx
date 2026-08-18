import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  CalendarDays,
  MapPin,
  Clock,
  UserPlus,
  Info,
  Users,
  ClipboardList,
  ClipboardCheck,
  Trash2,
  User,
  Phone,
  CreditCard,
  Calendar,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { fetchClassReports, deleteClassReport, type ClassReportRow } from '@/lib/classReports';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useMembers } from '@/contexts/MembersContext';

const STORAGE_KEY = 'retiro-vida-libertad';

// ─── Página principal ───────────────────────────────────────────────────────────

export default function RetiroVidaEnLibertad() {
  const navigate = useNavigate();
  const { members } = useMembers();

  // Inscrições externas (formulário público)
  const [inscripciones, setInscripciones] = useState<ClassReportRow[]>([]);
  const [loadingInscripciones, setLoadingInscripciones] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Asistencia (guardada en DB local)
  const { value: attendanceHistory, setValue: setAttendanceHistory } = useDbStorage<
    { date: string; presentIds: string[] }[]
  >(`vl-attendance-${STORAGE_KEY}`, []);

  // Dialog de marcar presencia
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [search, setSearch] = useState('');

  // IDs únicos de todos os membros já marcados como presentes (em qualquer sessão)
  const allPresentIds = useMemo(() => {
    const ids = new Set<string>();
    attendanceHistory.forEach((session) => session.presentIds.forEach((id) => ids.add(id)));
    return ids;
  }, [attendanceHistory]);

  // Membros marcados como presentes (objetos completos)
  const presentMembers = useMemo(() => {
    return members
      .filter((m) => allPresentIds.has(m.id))
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
  }, [members, allPresentIds]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingInscripciones(true);
      const reports = await fetchClassReports();
      if (!active) return;
      const filtered = reports
        .filter((r) => r.area === 'inscripcion-retiro-vida-libertad')
        .sort((a, b) => (b.report_date || '').localeCompare(a.report_date || ''));
      setInscripciones(filtered);
      setLoadingInscripciones(false);
    })();
    return () => { active = false; };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClassReport(deleteId);
      setInscripciones((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Inscripción eliminada');
    } catch {
      toast.error('No se pudo eliminar');
    }
    setDeleteId(null);
  };

  // Filtro de búsqueda para el dialog
  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...members].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
    if (!term) return sorted;
    return sorted.filter((m) => {
      const full = `${m.firstName} ${m.lastName}`.toLowerCase();
      return full.includes(term) || (m.email ?? '').toLowerCase().includes(term);
    });
  }, [members, search]);

  const togglePresent = (id: string) =>
    setPresentIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleSaveAttendance = () => {
    if (presentIds.length === 0) {
      toast.error('Seleccione al menos un miembro presente');
      return;
    }
    setAttendanceHistory([
      { date: attendanceDate, presentIds: [...presentIds] },
      ...attendanceHistory,
    ]);
    toast.success(`Asistencia registrada: ${presentIds.length} presente(s)`);
    setPresentIds([]);
    setSearch('');
    setAttendanceOpen(false);
  };

  const retiro = {
    fechaConfirmada: false,
    fecha: '',
    horario: '',
    lugar: '',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retiro Vida en Libertad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Un tiempo apartado para experimentar libertad y restauración
          </p>
        </div>

        {/* ── Card Próximo Retiro ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Próximo Retiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {retiro.fechaConfirmada ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Fecha:</span>
                  <span className="text-muted-foreground">{retiro.fecha}</span>
                </div>
                {retiro.horario && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Horario:</span>
                    <span className="text-muted-foreground">{retiro.horario}</span>
                  </div>
                )}
                {retiro.lugar && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Lugar:</span>
                    <span className="text-muted-foreground">{retiro.lugar}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Fecha por confirmar</p>
                  <p className="text-muted-foreground mt-1">
                    Aún no hay una fecha confirmada para el próximo Retiro Vida en Libertad.
                    Inscríbete y te notificaremos en cuanto se anuncie la fecha oficial.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={() => navigate('/inscripcion-retiro-vida-libertad')}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              <UserPlus className="w-4 h-4" />
              INSCRÍBETE
            </Button>

            <div className="pt-4 border-t border-border space-y-3">
              {/* Botón marcar presencia */}
              <Button
                variant="outline"
                onClick={() => {
                  setPresentIds([]);
                  setSearch('');
                  setAttendanceOpen(true);
                }}
                className="gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Marcar presencia
              </Button>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {members.length} miembro(s) en plataforma
                </Badge>
                {attendanceHistory.length > 0 && (
                  <Badge variant="secondary">
                    {attendanceHistory.length} registro(s) de asistencia
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Secciones de reportes separadas por categoría ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

          {/* ── Categoría 1: Inscritos (formulario público) ─────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ClipboardList className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Inscritos al Retiro</h2>
                <p className="text-xs text-muted-foreground">
                  Vía formulario de inscripción
                </p>
              </div>
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1">
                <Users className="w-3 h-3" />
                {inscripciones.length}
              </Badge>
            </div>

            {loadingInscripciones ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : inscripciones.length === 0 ? (
              <Card className="border-dashed border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <ClipboardList className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay inscripciones aún</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {inscripciones.map((ins) => {
                  const extra = (ins.extra || {}) as Record<string, unknown>;
                  const reportDate = ins.report_date
                    ? format(new Date(ins.report_date + 'T12:00:00'), 'PPP', { locale: es })
                    : 'Sin fecha';
                  return (
                    <Card
                      key={ins.id}
                      className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">
                            <ClipboardList className="w-3 h-3 mr-1" />
                            Inscripción
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {reportDate}
                            </span>
                            <button
                              onClick={() => setDeleteId(ins.id)}
                              className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Eliminar inscripción"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400 shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">Nombre</p>
                              <p className="text-sm font-medium text-foreground">
                                {ins.leader_name || '—'}
                              </p>
                            </div>
                          </div>

                          {extra.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Teléfono</p>
                                <p className="text-sm font-medium text-foreground">
                                  {extra.telefono as string}
                                </p>
                              </div>
                            </div>
                          )}

                          {extra.metodoPago && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Método de pago</p>
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {extra.metodoPago as string}
                                  {extra.numeroTransferencia
                                    ? ` – Ref: ${extra.numeroTransferencia}`
                                    : ''}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Categoría 2: Presencia registrada ───────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Presencia Registrada</h2>
                <p className="text-xs text-muted-foreground">
                  Miembros marcados como presentes
                </p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                <Users className="w-3 h-3" />
                {presentMembers.length}
              </Badge>
            </div>

            {presentMembers.length === 0 ? (
              <Card className="border-dashed border-emerald-500/20">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aún no hay miembros marcados como presentes
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Use "Marcar presencia" para registrar asistencia
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Resumen de sesiones */}
                {attendanceHistory.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">
                      Sesiones registradas ({attendanceHistory.length})
                    </p>
                    <div className="space-y-1">
                      {attendanceHistory.map((session, idx) => {
                        const sessionDate = session.date
                          ? format(new Date(session.date + 'T12:00:00'), 'PPP', { locale: es })
                          : 'Sin fecha';
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {sessionDate}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {session.presentIds.length} presente(s)
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Lista de miembros presentes */}
                <div className="space-y-2">
                  {presentMembers.map((m) => {
                    // Cuántas sesiones estuvo presente
                    const sessionCount = attendanceHistory.filter((s) =>
                      s.presentIds.includes(m.id)
                    ).length;
                    return (
                      <Card
                        key={m.id}
                        className="border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-emerald-500/10">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {m.firstName} {m.lastName}
                              </p>
                              {m.email && (
                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                              )}
                            </div>
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shrink-0 text-xs">
                              {sessionCount} sesión{sessionCount !== 1 ? 'es' : ''}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialog: Marcar presencia ──────────────────────────────────────── */}
      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Marcar presencia — Retiro Vida en Libertad
            </DialogTitle>
            <DialogDescription>
              Marque los miembros presentes en esta sesión
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Fecha</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar miembro..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {presentIds.length} seleccionado(s) · {filteredMembers.length} de {members.length} mostrado(s)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPresentIds(
                    presentIds.length === members.length ? [] : members.map((m) => m.id)
                  )
                }
                disabled={members.length === 0}
              >
                {presentIds.length === members.length ? 'Limpiar' : 'Marcar todos'}
              </Button>
            </div>

            <ScrollArea className="h-[300px] pr-3 rounded-md border border-border">
              {filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground px-4">
                  {search
                    ? 'No se encontraron miembros con ese nombre.'
                    : 'No hay miembros registrados en la plataforma.'}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredMembers.map((m) => {
                    const present = presentIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={cn(
                          'flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors',
                          present
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <Checkbox
                          checked={present}
                          onCheckedChange={() => togglePresent(m.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {m.firstName} {m.lastName}
                          </p>
                          {m.email && (
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          )}
                        </div>
                        {present && (
                          <Badge className="bg-success/15 text-success border-0 shrink-0">
                            Presente
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAttendance} disabled={presentIds.length === 0}>
              Guardar asistencia ({presentIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog: Eliminar inscripción ─────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La inscripción será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
