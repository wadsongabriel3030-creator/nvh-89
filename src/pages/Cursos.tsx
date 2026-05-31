import { useState } from 'react';
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
  DialogTrigger,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const initialCourses: CourseLevel[] = [
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

const mockMembers = [
  'Juan Pérez',
  'María González',
  'Carlos Rodríguez',
  'Ana Silva',
  'Pedro Martínez',
  'Lucía Fernández',
  'Roberto Díaz',
  'Sofía Ramírez',
];

export default function Cursos() {
  const [courses, setCourses] = useState<CourseLevel[]>(initialCourses);
  const [selectedClass, setSelectedClass] = useState<{ levelId: string; classItem: ClassItem } | null>(null);
  const [editingClass, setEditingClass] = useState<{ levelId: string; classItem: ClassItem } | null>(null);
  const [editName, setEditName] = useState('');
  const [addingToLevel, setAddingToLevel] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAddClass = (levelId: string) => {
    if (!newClassName.trim()) return;
    setCourses(prev =>
      prev.map(l =>
        l.id === levelId
          ? { ...l, classes: [...l.classes, { id: `c-${Date.now()}`, name: newClassName.trim() }] }
          : l
      )
    );
    toast.success('Clase agregada con éxito');
    setNewClassName('');
    setAddingToLevel(null);
  };

  const handleEditClass = () => {
    if (!editingClass || !editName.trim()) return;
    setCourses(prev =>
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
    toast.success('Clase editada con éxito');
    setEditingClass(null);
    setEditName('');
  };

  const handleDeleteClass = (levelId: string, classId: string) => {
    setCourses(prev =>
      prev.map(l =>
        l.id === levelId ? { ...l, classes: l.classes.filter(c => c.id !== classId) } : l
      )
    );
    toast.success('Clase eliminada');
  };

  const handleSaveAttendance = () => {
    const present = Object.values(attendance).filter(Boolean).length;
    toast.success(`Asistencia guardada: ${present} presentes`);
    setAttendance({});
    setNotes('');
  };

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
                Mapa de discipulado y gestión de clases por nivel
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

                    {/* Classes (com setas) */}
                    <div className="flex items-center gap-2 min-w-0 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0">
                      {level.classes.length > 0 && (
                        <ChevronRight className="w-5 h-5 text-orange-500 hidden md:block shrink-0" />
                      )}
                      {level.classes.map(cls => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass({ levelId: level.id, classItem: cls })}
                          className="bg-card border-2 border-foreground/20 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:border-primary hover:shadow-md transition-all whitespace-nowrap shrink-0"
                        >
                          {cls.name}
                        </button>
                      ))}
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
                {level.classes.map(cls => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">{cls.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedClass({ levelId: level.id, classItem: cls })}
                        title="Gerenciar"
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la clase "{cls.name}". No se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClass(level.id, cls.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
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
      </div>

      {/* Dialog: Gerenciar clase (asistencia) */}
      <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Gestionar: {selectedClass?.classItem.name}
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
                  const key = `${selectedClass?.classItem.id}-${i}`;
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

      {/* Dialog: Agregar clase */}
      <Dialog open={!!addingToLevel} onOpenChange={(o) => !o && setAddingToLevel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva clase</DialogTitle>
            <DialogDescription>
              Agregar una nueva clase al nivel{' '}
              {courses.find(c => c.id === addingToLevel)?.name}
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
    </MainLayout>
  );
}
