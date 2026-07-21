import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Eye,
  Plus,
  Settings,
  Pencil,
  Trash2,
  UserCheck,
  Users,
  FileText,
  ClipboardList,
  Calendar,
  User,
  CheckCircle,
  Phone,
  MessageSquare,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PasosFirmesReporteDialog, CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';
import { fetchClassReports, type ClassReportRow } from '@/lib/classReports';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CURSO_ABRIR_LOS_OJOS: CursoPasosFirmes & { descripcion: string; totalLabel: string } = {
  id: 'abrir-los-ojos',
  nombre: 'Abrir los Ojos',
  descripcion: 'Curso introductorio del proceso de discipulado de Nuevos Hechos',
  totalLabel: '1 LECCIÓN',
  color: 'text-primary',
  lecciones: ['Abrir los Ojos'],
};

interface ClassItem {
  id: string;
  name: string;
}

const initialClasses: ClassItem[] = [
  { id: 'ao-1', name: 'Clase 1 - Introducción' },
  { id: 'ao-2', name: 'Clase 2 - Identidad' },
  { id: 'ao-3', name: 'Clase 3 - Propósito' },
];

const mockMembers = [
  'Juan Pérez',
  'María González',
  'Carlos Rodríguez',
  'Ana Silva',
  'Pedro Martínez',
  'Lucía Fernández',
];

export default function AbrirLosOjos() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editName, setEditName] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);

  const [allReports, setAllReports] = useState<ClassReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingReports(true);
      const reports = await fetchClassReports();
      if (!active) return;
      
      const filtered = reports.filter(r => r.area === 'abrir-los-ojos');
      
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
            {getReportTypeBadge()}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {reportDate}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Impartido por</p>
                <p className="text-sm font-medium text-foreground">{report.leader_name || '—'}</p>
              </div>
            </div>
            {extra.diaReunion && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Día de reunión</p>
                  <p className="text-sm font-medium text-foreground">{extra.diaReunion as string}</p>
                </div>
              </div>
            )}
            {report.attendee_names && report.attendee_names.length > 0 && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Asistentes ({report.attendee_names.length})</p>
                  <p className="text-sm text-foreground">{report.attendee_names.join(', ')}</p>
                </div>
              </div>
            )}
            {extra.cantidadInvitados && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Invitados ({extra.cantidadInvitados as string})</p>
                  <p className="text-sm text-foreground">{(extra.nombresInvitados as string) || '—'}</p>
                </div>
              </div>
            )}
            {extra.huboDecisiones !== null && extra.huboDecisiones !== undefined && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Decisiones</p>
                  <p className="text-sm text-foreground">
                    {extra.huboDecisiones ? 'Sí' : 'No'}
                    {extra.huboDecisiones && extra.decisionesInfo ? ` - ${extra.decisionesInfo}` : ''}
                  </p>
                </div>
              </div>
            )}
            {extra.testimonios && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Testimonios</p>
                  <p className="text-sm text-foreground">{extra.testimonios as string}</p>
                </div>
              </div>
            )}
            {extra.comentarios && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Comentarios finales</p>
                  <p className="text-sm text-foreground">{extra.comentarios as string}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    setClasses(prev => [...prev, { id: `ao-${Date.now()}`, name: newClassName.trim() }]);
    toast.success('Clase agregada con éxito');
    setNewClassName('');
    setAddOpen(false);
  };

  const handleEditClass = () => {
    if (!editingClass || !editName.trim()) return;
    setClasses(prev =>
      prev.map(c => (c.id === editingClass.id ? { ...c, name: editName.trim() } : c))
    );
    toast.success('Clase editada con éxito');
    setEditingClass(null);
    setEditName('');
  };

  const handleDeleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    toast.success('Clase eliminada');
  };

  const handleSaveAttendance = () => {
    const present = Object.values(attendance).filter(Boolean).length;
    toast.success(`Asistencia guardada: ${present} presentes`);
    setAttendance({});
    setNotes('');
    setSelectedClass(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Abrir Los Ojos</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestione las clases del proceso Abrir Los Ojos
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={() => navigate('/reporte-abrir-los-ojos')}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Reporte</span>
            </Button>
            <Button
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Nueva clase</span>
            </Button>
          </div>
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

      {/* Dialog: Gestionar asistencia */}
      <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Gestionar: {selectedClass?.name}
            </DialogTitle>
            <DialogDescription>
              Marcar asistencia de los miembros y registrar notas de la clase
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha de la clase</Label>
                <Input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Total presente</Label>
                <Input
                  readOnly
                  value={`${Object.values(attendance).filter(Boolean).length} / ${mockMembers.length}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Miembros inscritos
              </Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {mockMembers.map((m, i) => {
                  const key = `${selectedClass?.id}-${i}`;
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={!!attendance[key]}
                        onCheckedChange={(c) =>
                          setAttendance(prev => ({ ...prev, [key]: !!c }))
                        }
                      />
                      <span className="text-sm flex-1">{m}</span>
                      {attendance[key] && (
                        <Badge variant="secondary" className="text-xs">
                          Presente
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notas de la clase</Label>
              <Textarea
                placeholder="Observaciones, temas tratados, próximos pasos..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClass(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAttendance}>Guardar asistencia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar clase */}
      <Dialog open={!!editingClass} onOpenChange={(o) => !o && setEditingClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar clase</DialogTitle>
            <DialogDescription>Actualizar el nombre de la clase</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nombre de la clase</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClass(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditClass}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nueva clase */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva clase</DialogTitle>
            <DialogDescription>
              Agregar una nueva clase a Abrir Los Ojos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nombre de la clase</Label>
            <Input
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="Ej: Clase 4 - Visión"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddClass}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PasosFirmesReporteDialog
        open={reporteOpen}
        onOpenChange={setReporteOpen}
        curso={CURSO_ABRIR_LOS_OJOS}
      />
    </MainLayout>
  );
}
