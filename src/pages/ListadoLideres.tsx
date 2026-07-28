import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Users, Phone, UserPlus, Trash2 } from 'lucide-react';
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
};

const categoryColors: Record<string, string> = {
  Adulto: 'bg-primary/10 text-primary border-0',
  'Joven Adulto': 'bg-amber-500/10 text-amber-600 border-0',
  Joven: 'bg-emerald-500/10 text-emerald-600 border-0',
};

export default function ListadoLideres() {
  const queryClient = useQueryClient();

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaders_list')
        .select('id, position, name, category, phone')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Leader[];
    },
  });

  // Add maestro dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Adulto');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteLeader, setDeleteLeader] = useState<Leader | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
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
      });
      if (error) throw error;

      toast.success('¡Maestro agregado con éxito!');
      queryClient.invalidateQueries({ queryKey: ['leaders_list'] });
      setNewName('');
      setNewCategory('Adulto');
      setNewPhone('');
      setAddOpen(false);
    } catch {
      toast.error('Error al agregar maestro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteLeader) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('leaders_list')
        .delete()
        .eq('id', deleteLeader.id);
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

  const totalAdultos = leaders.filter((l) => l.category === 'Adulto').length;
  const totalJovenAdulto = leaders.filter((l) => l.category === 'Joven Adulto').length;
  const totalJovenes = leaders.filter((l) => l.category === 'Joven').length;

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAdultos}</p>
                <p className="text-sm text-muted-foreground">Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenAdulto}</p>
                <p className="text-sm text-muted-foreground">Jóvenes Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenes}</p>
                <p className="text-sm text-muted-foreground">Jóvenes</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-16 text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {leader.position}
                    </TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>
                      <Badge className={categoryColors[leader.category] || ''}>
                        {leader.category}
                      </Badge>
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

      {/* Add Maestro Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Agregar Maestro</DialogTitle>
            <DialogDescription>Registre un nuevo maestro en el listado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre Completo *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="grid gap-2">
              <Label>Categoría *</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Joven Adulto">Joven Adulto</SelectItem>
                  <SelectItem value="Joven">Joven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Número de teléfono"
              />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLeader} onOpenChange={(o) => !o && setDeleteLeader(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar maestro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <span className="font-semibold text-foreground">{deleteLeader?.name}</span> del listado de maestros. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
