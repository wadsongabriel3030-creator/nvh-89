import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Users, Phone, UserPlus, Trash2, GraduationCap, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Leader = {
  id: string;
  position: number;
  name: string;
  category: 'Adulto' | 'Joven Adulto' | 'Joven';
  phone: string | null;
  cargo?: string[] | null;
};

const categoryColors: Record<string, string> = {
  Adulto: 'bg-primary/10 text-primary border-0',
  'Joven Adulto': 'bg-amber-500/10 text-amber-600 border-0',
  Joven: 'bg-emerald-500/10 text-emerald-600 border-0',
};

// Colores por curso
const cargoColors: Record<string, string> = {
  'Vida Nuevos Hechos':              'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Pasos Firmes':                    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Vida en Libertad':                'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Administración':                  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'La Familia':                      'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Creencias Básicas de la Cristiandad': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
};

const CURSOS = [
  'Vida Nuevos Hechos',
  'Pasos Firmes',
  'Vida en Libertad',
  'Administración',
  'La Familia',
  'Creencias Básicas de la Cristiandad',
];

export default function ListadoLideres() {
  const queryClient = useQueryClient();

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaders_list')
        .select('id, position, name, category, phone, cargo')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Leader[];
    },
  });

  // ── Add dialog state ──────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Adulto');
  const [newPhone, setNewPhone] = useState('');
  const [newCargo, setNewCargo] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Edit cargo dialog state ───────────────────────────────
  const [editLeader, setEditLeader] = useState<Leader | null>(null);
  const [editCargo, setEditCargo] = useState<string[]>([]);
  const [savingCargo, setSavingCargo] = useState(false);

  // ── Delete state ──────────────────────────────────────────
  const [deleteLeader, setDeleteLeader] = useState<Leader | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Helpers ───────────────────────────────────────────────
  const toggleCargo = (curso: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(curso) ? current.filter(c => c !== curso) : [...current, curso]);
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const nextPosition = leaders.length > 0
        ? Math.max(...leaders.map(l => l.position)) + 1
        : 1;

      const { error } = await supabase.from('leaders_list').insert({
        name: newName.trim(),
        category: newCategory,
        phone: newPhone.trim() || null,
        position: nextPosition,
        cargo: newCargo.length > 0 ? newCargo : null,
      });
      if (error) throw error;

      toast.success('¡Maestro agregado con éxito!');
      queryClient.invalidateQueries({ queryKey: ['leaders_list'] });
      setNewName(''); setNewCategory('Adulto'); setNewPhone(''); setNewCargo([]);
      setAddOpen(false);
    } catch {
      toast.error('Error al agregar maestro');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCargo = async () => {
    if (!editLeader) return;
    setSavingCargo(true);
    try {
      const { error } = await supabase
        .from('leaders_list')
        .update({ cargo: editCargo.length > 0 ? editCargo : null })
        .eq('id', editLeader.id);
      if (error) throw error;
      toast.success('Cargo actualizado');
      queryClient.invalidateQueries({ queryKey: ['leaders_list'] });
      setEditLeader(null);
    } catch {
      toast.error('Error al actualizar cargo');
    } finally {
      setSavingCargo(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteLeader) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('leaders_list').delete().eq('id', deleteLeader.id);
      if (error) throw error;
      toast.success('Maestro eliminado');
      queryClient.invalidateQueries({ queryKey: ['leaders_list'] });
    } catch {
      toast.error('Error al eliminar maestro');
    } finally {
      setDeleting(false);
      setDeleteLeader(null);
    }
  };

  const totalAdultos     = leaders.filter(l => l.category === 'Adulto').length;
  const totalJovenAdulto = leaders.filter(l => l.category === 'Joven Adulto').length;
  const totalJovenes     = leaders.filter(l => l.category === 'Joven').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Listado de Maestros</h1>
              <p className="text-muted-foreground">
                {isLoading ? 'Cargando…' : `${leaders.length} líderes registrados`}
              </p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Agregar Maestro
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAdultos}</p>
                <p className="text-sm text-muted-foreground">Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10"><Users className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenAdulto}</p>
                <p className="text-sm text-muted-foreground">Jóvenes Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenes}</p>
                <p className="text-sm text-muted-foreground">Jóvenes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Líderes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Curso a Impartir</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-16 text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell className="font-medium text-muted-foreground">{leader.position}</TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>
                      <Badge className={categoryColors[leader.category] || ''}>{leader.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {/* Cargo tags + edit button */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {leader.cargo && leader.cargo.length > 0 ? (
                          leader.cargo.map(c => (
                            <Badge
                              key={c}
                              className={`text-xs ${cargoColors[c] ?? 'bg-muted/50 text-muted-foreground border-0'}`}
                            >
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">Sin asignar</span>
                        )}
                        <button
                          onClick={() => { setEditLeader(leader); setEditCargo(leader.cargo ?? []); }}
                          className="ml-1 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar cargo"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {leader.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => setDeleteLeader(leader)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar maestro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Add Maestro Dialog ─────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Agregar Maestro</DialogTitle>
            <DialogDescription>Registre un nuevo maestro en el listado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre Completo *</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre y apellido" />
            </div>
            <div className="grid gap-2">
              <Label>Categoría *</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue placeholder="Seleccione categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Joven Adulto">Joven Adulto</SelectItem>
                  <SelectItem value="Joven">Joven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Número de teléfono" />
            </div>
            <div className="grid gap-2">
              <Label>Curso a Impartir</Label>
              <p className="text-xs text-muted-foreground">Selecciona uno o varios cursos</p>
              <div className="flex flex-wrap gap-2">
                {CURSOS.map(curso => (
                  <button
                    key={curso}
                    type="button"
                    onClick={() => toggleCargo(curso, newCargo, setNewCargo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      newCargo.includes(curso)
                        ? `${cargoColors[curso]} border-current`
                        : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {curso}
                  </button>
                ))}
              </div>
              {newCargo.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {newCargo.map(c => (
                    <Badge key={c} className={`gap-1 text-xs ${cargoColors[c] ?? ''}`}>
                      {c}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCargo(c, newCargo, setNewCargo)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Cargo Dialog ──────────────────────────────────────── */}
      <Dialog open={!!editLeader} onOpenChange={o => !o && setEditLeader(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Curso a Impartir
            </DialogTitle>
            <DialogDescription>
              Asigna los cursos que imparte <span className="font-semibold text-foreground">{editLeader?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CURSOS.map(curso => (
                <button
                  key={curso}
                  type="button"
                  onClick={() => toggleCargo(curso, editCargo, setEditCargo)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                    editCargo.includes(curso)
                      ? `${cargoColors[curso]} border-current`
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {curso}
                </button>
              ))}
            </div>
            {editCargo.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Seleccionados:</p>
                <div className="flex flex-wrap gap-1.5">
                  {editCargo.map(c => (
                    <Badge key={c} className={`gap-1 text-xs ${cargoColors[c] ?? ''}`}>
                      {c}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCargo(c, editCargo, setEditCargo)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLeader(null)}>Cancelar</Button>
            <Button onClick={handleSaveCargo} disabled={savingCargo}>
              {savingCargo ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────── */}
      <AlertDialog open={!!deleteLeader} onOpenChange={o => !o && setDeleteLeader(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar maestro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <span className="font-semibold text-foreground">{deleteLeader?.name}</span> del listado de maestros. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
