import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookOpen, FileText, ClipboardList, Calendar, User, Users, Heart, MessageSquare, Trash2, UserPlus, Flame, Pencil } from 'lucide-react';
import type { CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';
import { fetchClassReports, deleteClassReport, type ClassReportRow } from '@/lib/classReports';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';
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

interface EventSettings {
  fechaInicio: string;
  horario: string;
  lugar: string;
  costoLibro: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCuenta: string;
  fechaLimitePago: string;
  whatsapp: string;
  costoRetiro: string;
}

const DEFAULT_SETTINGS: EventSettings = {
  fechaInicio: 'LUNES 15 DE JUNIO',
  horario: '7:30 P.M.',
  lugar: 'DANCE FACTORY MAJADAS, C.C. MAJADAS ONCE',
  costoLibro: 'Q100.00',
  banco: 'BANCO INDUSTRIAL',
  tipoCuenta: 'Cuenta Monetaria',
  numeroCuenta: '0490192499',
  nombreCuenta: 'IGLESIA CRISTIANA CONEXIÓN',
  fechaLimitePago: 'LUNES 15 DE JUNIO',
  whatsapp: '3067-5112',
  costoRetiro: 'Q200.00',
};


const CURSO: CursoPasosFirmes & { icon: typeof BookOpen; descripcion: string; totalLabel: string } = {
  id: 'curso-vida-libertad',
  nombre: 'Curso Vida en Libertad',
  descripcion: 'Curso para crecer en libertad espiritual en Nuevos Hechos',
  totalLabel: '12 LECCIONES',
  color: 'text-primary',
  icon: BookOpen,
  lecciones: [
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
  ],
};

export default function CursoVidaEnLibertad() {
  const navigate = useNavigate();

  // Settings compartidos con la página de inscripción
  const { value: settings, setValue: setSettings, loading: loadingSettings } =
    useDbStorage<EventSettings>('inscripcion-cvl-settings', DEFAULT_SETTINGS, 'vida-libertad');

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<EventSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!loadingSettings) setEditDraft(settings);
  }, [loadingSettings, settings]);

  const handleSaveSettings = () => {
    setSettings(editDraft);
    setEditOpen(false);
    toast.success('Información del evento actualizada');
  };

  const [allReports, setAllReports] = useState<ClassReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
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

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingReports(true);
      const reports = await fetchClassReports();
      if (!active) return;

      const filtered = reports.filter(r => r.area === 'curso-vida-libertad');

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

  const getReportTypeBadge = () => {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
        <FileText className="w-3 h-3 mr-1" />
        Reporte de Clase
      </Badge>
    );
  };

  const renderReportCard = (report: ClassReportRow) => {
    const extra = (report.extra || {}) as Record<string, unknown>;
    const reportDate = report.report_date
      ? format(new Date(report.report_date + 'T12:00:00'), 'PPP', { locale: es })
      : 'Sin fecha';

    return (
      <Card key={report.id} className="border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {getReportTypeBadge()}
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

  const Icon = CURSO.icon;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Curso Vida en Libertad</h1>
              <p className="text-sm text-muted-foreground">
                Curso para crecer en libertad espiritual en Nuevos Hechos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => navigate('/compromiso-vida-en-libertad')}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
              size="lg"
            >
              <Flame className="w-5 h-5" />
              Compromiso
            </Button>
            <Button
              onClick={() => navigate('/inscripcion-curso-vida-libertad')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
              size="lg"
            >
              <UserPlus className="w-5 h-5" />
              INSCRÍBETE
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-soft transition-all duration-300 animate-fade-in flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className={`p-2 rounded-lg bg-muted ${CURSO.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Editar información del curso"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <Badge variant="secondary" className="font-semibold">
                    {CURSO.totalLabel}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl mt-3">{CURSO.nombre}</CardTitle>
              <CardDescription>{CURSO.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lecciones
                </p>
                <ul className="space-y-1">
                  {CURSO.lecciones.map((l) => (
                    <li key={l} className="text-sm text-foreground flex gap-2">
                      <span className={`${CURSO.color} shrink-0`}>•</span>
                      <span className="line-clamp-1">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => navigate(`/reporte-pasos-firmes/${CURSO.id}`)}
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Reportes</h2>
              <p className="text-sm text-muted-foreground">Reportes de Clase</p>
            </div>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : allReports.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay reportes registrados aún</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Los reportes aparecerán aquí cuando se envíen reportes de clase.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allReports.map((report) => renderReportCard(report))}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog: Editar información del curso ──────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar información del Curso
            </DialogTitle>
            <DialogDescription>
              Los cambios se reflejarán en la página de inscripción
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fecha de inicio</Label>
                <Input
                  value={editDraft.fechaInicio}
                  onChange={(e) => setEditDraft({ ...editDraft, fechaInicio: e.target.value })}
                  placeholder="LUNES 15 DE JUNIO"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Horario</Label>
                <Input
                  value={editDraft.horario}
                  onChange={(e) => setEditDraft({ ...editDraft, horario: e.target.value })}
                  placeholder="7:30 P.M."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Lugar</Label>
              <Input
                value={editDraft.lugar}
                onChange={(e) => setEditDraft({ ...editDraft, lugar: e.target.value })}
                placeholder="DANCE FACTORY MAJADAS..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Costo del libro</Label>
                <Input
                  value={editDraft.costoLibro}
                  onChange={(e) => setEditDraft({ ...editDraft, costoLibro: e.target.value })}
                  placeholder="Q100.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Costo del retiro</Label>
                <Input
                  value={editDraft.costoRetiro}
                  onChange={(e) => setEditDraft({ ...editDraft, costoRetiro: e.target.value })}
                  placeholder="Q200.00"
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Datos bancarios</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Banco</Label>
                  <Input
                    value={editDraft.banco}
                    onChange={(e) => setEditDraft({ ...editDraft, banco: e.target.value })}
                    placeholder="BANCO INDUSTRIAL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo de cuenta</Label>
                    <Input
                      value={editDraft.tipoCuenta}
                      onChange={(e) => setEditDraft({ ...editDraft, tipoCuenta: e.target.value })}
                      placeholder="Cuenta Monetaria"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Número de cuenta</Label>
                    <Input
                      value={editDraft.numeroCuenta}
                      onChange={(e) => setEditDraft({ ...editDraft, numeroCuenta: e.target.value })}
                      placeholder="0490192499"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>A nombre de</Label>
                  <Input
                    value={editDraft.nombreCuenta}
                    onChange={(e) => setEditDraft({ ...editDraft, nombreCuenta: e.target.value })}
                    placeholder="IGLESIA CRISTIANA CONEXIÓN"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fechas y contacto</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha límite de pago</Label>
                  <Input
                    value={editDraft.fechaLimitePago}
                    onChange={(e) => setEditDraft({ ...editDraft, fechaLimitePago: e.target.value })}
                    placeholder="LUNES 15 DE JUNIO"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp</Label>
                  <Input
                    value={editDraft.whatsapp}
                    onChange={(e) => setEditDraft({ ...editDraft, whatsapp: e.target.value })}
                    placeholder="3067-5112"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSettings}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
