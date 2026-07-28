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
} from '@/components/ui/alert-dialog';
import {
  GraduationCap,
  ArrowUp,
  Plus,
  Settings,
  Pencil,
  Trash2,
  UserCheck,
  Users,
  ChevronRight,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDbStorage } from '@/hooks/useDbStorage';
import { saveClassReport, fetchClassReports, type ClassReportRow } from '@/lib/classReports';
import { supabase } from '@/integrations/supabase/client';

interface ClassItem {
  id: string;
  name: string;
}

interface CourseLevel {
  id: string;
  level: number;
  name: string;
  color: string;
  classes: ClassItem[];
}

const DEFAULT_COURSES: CourseLevel[] = [
  {
    id: 'l1',
    level: 1,
    name: 'Nueva Vida',
    color: 'bg-emerald-500',
    classes: [
      { id: 'c1', name: 'Vida NH' },
      { id: 'c2', name: 'Pasos Firmes' },
      { id: 'c3', name: 'Abrir los Ojos' },
    ],
  },
  {
    id: 'l2',
    level: 2,
    name: 'Vida en Libertad',
    color: 'bg-sky-500',
    classes: [
      { id: 'c4', name: 'Curso Vida en Libertad' },
      { id: 'c5', name: 'Retiro Libertad' },
    ],
  },
  {
    id: 'l3',
    level: 3,
    name: 'Administración',
    color: 'bg-amber-500',
    classes: [
      { id: 'c6', name: 'Administración' },
      { id: 'c7', name: 'Práctica Generosidad' },
    ],
  },
  {
    id: 'l4',
    level: 4,
    name: 'Lo que Creemos',
    color: 'bg-violet-500',
    classes: [
      { id: 'c8', name: 'Creencias Básicas' },
      { id: 'c9', name: 'Práctica Supervisada' },
    ],
  },
  {
    id: 'l5',
    level: 5,
    name: 'La Familia',
    color: 'bg-rose-500',
    classes: [
      { id: 'c10', name: 'La Familia Cristiana' },
      { id: 'c11', name: 'Seminario Familia' },
    ],
  },
  {
    id: 'l6',
    level: 6,
    name: 'Graduación',
    color: 'bg-yellow-500',
    classes: [],
  },
];

interface MemberBasic {
  id: string;
  first_name: string;
  last_name: string;
}

export default function Cursos() {
  // ── Persist courses structure in database ──
  const {
    value: courses,
    setValue: setCourses,
    loading: loadingCourses,
  } = useDbStorage<CourseLevel[]>('cursos-niveles', DEFAULT_COURSES, 'cursos');

  // ── Real members from Supabase ──
  const [members, setMembers] = useState<MemberBasic[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .order('first_name', { ascending: true });
      if (!active) return;
      if (!error && data) setMembers(data as MemberBasic[]);
      setLoadingMembers(false);
    })();
    return () => { active = false; };
  }, []);

  // ── Class reports from database ──
  const [classReports, setClassReports] = useState<ClassReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const loadReports = async () => {
    setLoadingReports(true);
    const reports = await fetchClassReports();
    const filtered = reports.filter(r => r.area.startsWith('cursos-'));
    filtered.sort((a, b) => (b.report_date ?? '').localeCompare(a.report_date ?? ''));
    setClassReports(filtered);
    setLoadingReports(false);
  };

  useEffect(() => { loadReports(); }, []);

  // ── UI State ──
  const [selectedClass, setSelectedClass] = useState<{ levelId: string; classItem: ClassItem } | null>(null);
  const [editingClass, setEditingClass] = useState<{ levelId: string; classItem: ClassItem } | null>(null);
  const [editName, setEditName] = useState('');
  const [addingToLevel, setAddingToLevel] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ levelId: string; classId: string; className: string } | null>(null);

  // Attendance dialog state
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [leaderName, setLeaderName] = useState('');

  // Reset attendance when opening a class
  useEffect(() => {
    if (selectedClass) {
      setAttendance({});
      setAttendanceDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setLeaderName('');
    }
  }, [selectedClass]);

  // ── Handlers ──
  const handleAddClass = (levelId: string) => {
    if (!newClassName.trim()) return;
    setCourses((prev) =>
      prev.map(l =>
        l.id === levelId
          ? { ...l, classes: [...l.classes, { id: `c-${Date.now()}`, name: newClassName.trim() }] }
          : l
      )
    );
    toast.success('Clase agregada y guardada en la base de datos');
    setNewClassName('');
    setAddingToLevel(null);
  };

  const handleEditClass = () => {
    if (!editingClass || !editName.trim()) return;
    setCourses((prev) =>
      prev.map(l =>
        l.id === editingClass.levelId
          ? {
              ...l,
              classes: l.classes.map(c =>
                c.id === editingClass.classItem.id ? { ...c, name: editName.trim() } : c
              ),
            }
          : l
      )
    );
    toast.success('Clase editada y guardada en la base de datos');
    setEditingClass(null);
    setEditName('');
  };

  const handleDeleteClass = () => {
    if (!deleteTarget) return;
    setCourses((prev) =>
      prev.map(l =>
        l.id === deleteTarget.levelId
          ? { ...l, classes: l.classes.filter(c => c.id !== deleteTarget.classId) }
          : l
      )
    );
    toast.success('Clase eliminada de la base de datos');
    setDeleteTarget(null);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSavingAttendance(true);
    try {
      const presentIds = Object.entries(attendance)
        .filter(([, v]) => v)
        .map(([key]) => key);
      const presentNames = presentIds
        .map(id => {
          const m = members.find(mb => mb.id === id);
          return m ? `${m.first_name} ${m.last_name}` : '';
        })
        .filter(Boolean);

      await saveClassReport({
        area: `cursos-${selectedClass.classItem.id}`,
        leccion: selectedClass.classItem.name,
        reportDate: new Date(attendanceDate + 'T12:00:00'),
        leaderName: leaderName.trim() || null,
        attendeeIds: presentIds,
        attendeeNames: presentNames,
        extra: {
          levelId: selectedClass.levelId,
          notes: notes.trim() || null,
        },
      });

      toast.success(`Asistencia guardada: ${presentIds.length} presentes`);
      setSelectedClass(null);
      loadReports();
    } catch {
      toast.error('Error al guardar asistencia');
    } finally {
      setSavingAttendance(false);
    }
  };

  // ── Computed ──
  const totalClasses = courses.reduce((sum, l) => sum + l.classes.length, 0);
  const getReportsForClass = (classId: string) =>
    classReports.filter(r => r.area === `cursos-${classId}`);

  if (loadingCourses) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
              <p className="text-muted-foreground">
                {courses.length} niveles · {totalClasses} clases · Datos sincronizados con la base de datos
              </p>
            </div>
          </div>
        </div>

        {/* Mapa Visual de Niveles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Mapa del Camino de Discipulado
            </CardTitle>
            <CardDescription>
              Recorrido completo desde Nueva Vida hasta la Graduación
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6">
            <div className="flex flex-col-reverse gap-4">
              {courses.map((level, idx) => (
                <div key={level.id}>
                  {idx < courses.length && idx > 0 && (
                    <div className="flex justify-center mb-4">
                      <ArrowUp className="w-6 h-6 text-orange-500" />
                    </div>
                  )}
                  <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] gap-3 md:gap-4 md:items-center">
                    {/* Nível */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0',
                          level.color
                        )}
                      >
                        {level.level}
                      </div>
                      <div className="bg-card border-2 border-foreground/20 rounded-lg px-3 py-2 text-sm sm:text-base font-semibold text-foreground shadow-sm whitespace-nowrap">
                        {level.name}
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="flex items-center gap-2 min-w-0 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0">
                      {level.classes.length > 0 && (
                        <ChevronRight className="w-5 h-5 text-orange-500 hidden md:block shrink-0" />
                      )}
                      {level.classes.map(cls => {
                        const reportCount = getReportsForClass(cls.id).length;
                        return (
                          <button
                            key={cls.id}
                            onClick={() => setSelectedClass({ levelId: level.id, classItem: cls })}
                            className="bg-card border-2 border-foreground/20 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:border-primary hover:shadow-md transition-all whitespace-nowrap shrink-0 relative"
                          >
                            {cls.name}
                            {reportCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {reportCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingToLevel(level.id)}
                        className="gap-1 border-dashed text-xs sm:text-sm whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        Agregar clase
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista detallada de cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(level => (
            <Card key={level.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold',
                      level.color
                    )}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{level.name}</CardTitle>
                    <CardDescription>
                      {level.classes.length} {level.classes.length === 1 ? 'clase' : 'clases'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {level.classes.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Sin clases registradas</p>
                )}
                {level.classes.map(cls => {
                  const reportCount = getReportsForClass(cls.id).length;
                  return (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{cls.name}</span>
                        {reportCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                            {reportCount} {reportCount === 1 ? 'reporte' : 'reportes'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedClass({ levelId: level.id, classItem: cls })}
                          title="Gestionar asistencia"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingClass({ levelId: level.id, classItem: cls });
                            setEditName(cls.name);
                          }}
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({ levelId: level.id, classId: cls.id, className: cls.name })
                          }
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 mt-2"
                  onClick={() => setAddingToLevel(level.id)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva clase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        {!loadingReports && classReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Reportes de Asistencia Recientes
              </CardTitle>
              <CardDescription>
                Últimos {Math.min(classReports.length, 10)} reportes guardados en la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classReports.slice(0, 10).map(report => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {report.leccion || report.area}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {report.report_date && <span>{report.report_date}</span>}
                        {report.leader_name && <span>· {report.leader_name}</span>}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <Users className="w-3 h-3 mr-1" />
                      {report.attendee_names?.length ?? 0} asistentes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog: Gestionar clase (asistencia con miembros reales) */}
      <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Gestionar: {selectedClass?.classItem.name}
            </DialogTitle>
            <DialogDescription>
              Marcar asistencia de los miembros y registrar notas. Los datos se guardarán en la base de datos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha de la clase *</Label>
                <Input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Impartido por</Label>
                <Input
                  placeholder="Nombre del maestro"
                  value={leaderName}
                  onChange={e => setLeaderName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <span className="text-sm font-medium text-foreground">Total presente</span>
              <Badge className="text-sm">
                {Object.values(attendance).filter(Boolean).length} / {members.length}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Miembros ({members.length})
              </Label>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  No hay miembros registrados en la base de datos
                </p>
              ) : (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {members.map(m => {
                    const key = m.id;
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
                        <span className="text-sm flex-1">
                          {m.first_name} {m.last_name}
                        </span>
                        {attendance[key] && (
                          <Badge variant="secondary" className="text-xs">
                            Presente
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
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
            <Button onClick={handleSaveAttendance} disabled={savingAttendance}>
              {savingAttendance ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar asistencia'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar clase */}
      <Dialog open={!!editingClass} onOpenChange={(o) => !o && setEditingClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar clase</DialogTitle>
            <DialogDescription>Actualizar el nombre de la clase. Los cambios se guardarán automáticamente.</DialogDescription>
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

      {/* Dialog: Agregar clase */}
      <Dialog open={!!addingToLevel} onOpenChange={(o) => !o && setAddingToLevel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva clase</DialogTitle>
            <DialogDescription>
              Agregar una nueva clase al nivel{' '}
              {courses.find(c => c.id === addingToLevel)?.name}. Se guardará automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nombre de la clase</Label>
            <Input
              placeholder="Ej: Nueva Clase"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingToLevel(null)}>
              Cancelar
            </Button>
            <Button onClick={() => addingToLevel && handleAddClass(addingToLevel)}>
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar eliminación de clase */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la clase "<span className="font-semibold text-foreground">{deleteTarget?.className}</span>" de la base de datos. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
