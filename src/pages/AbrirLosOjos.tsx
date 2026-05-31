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
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PasosFirmesReporteDialog, CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';

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

        {/* Curso card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg bg-muted text-primary">
                  <Eye className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {CURSO_ABRIR_LOS_OJOS.totalLabel}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-3">{CURSO_ABRIR_LOS_OJOS.nombre}</CardTitle>
              <CardDescription>{CURSO_ABRIR_LOS_OJOS.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lecciones
                </p>
                <ul className="space-y-1">
                  {CURSO_ABRIR_LOS_OJOS.lecciones.map((l) => (
                    <li key={l} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setReporteOpen(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Reporte
              </Button>
            </CardContent>
          </Card>
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
