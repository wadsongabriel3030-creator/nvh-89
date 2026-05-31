import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { CourseStudent } from './ViewStudentsDialog';
import { useMembers } from '@/contexts/MembersContext';
import { cn } from '@/lib/utils';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  enrolledStudentIds: string[];
  onAdd: (students: CourseStudent[]) => void;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  courseName,
  enrolledStudentIds,
  onAdd,
}: AddStudentDialogProps) {
  const { members } = useMembers();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const enrolledSet = useMemo(() => new Set(enrolledStudentIds), [enrolledStudentIds]);

  const availableMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members
      .filter((m) => !enrolledSet.has(m.id))
      .filter((m) => {
        if (!term) return true;
        const full = `${m.firstName} ${m.lastName}`.toLowerCase();
        return full.includes(term) || (m.email ?? '').toLowerCase().includes(term);
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
  }, [members, enrolledSet, search]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error('Seleccione al menos un alumno');
      return;
    }
    const toAdd: CourseStudent[] = selectedIds
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`.trim(),
        email: m.email,
        attendanceRate: 0,
      }));
    onAdd(toAdd);
    toast.success(
      `${toAdd.length} alumno${toAdd.length !== 1 ? 's' : ''} agregado${toAdd.length !== 1 ? 's' : ''} a ${courseName}`
    );
    setSelectedIds([]);
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Agregar Alumno - {courseName}
          </DialogTitle>
          <DialogDescription>
            Seleccione los miembros registrados que desea matricular en este curso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar miembro por nombre o correo..."
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[320px] pr-3 rounded-md border border-border">
            {availableMembers.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground px-4">
                {members.length === enrolledSet.size
                  ? 'Todos los miembros ya están matriculados en este curso.'
                  : 'No se encontraron miembros disponibles.'}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableMembers.map((m) => {
                  const checked = selectedIds.includes(m.id);
                  const fullName = `${m.firstName} ${m.lastName}`.trim();
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggle(m.id)}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors',
                        checked
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(m.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{fullName}</p>
                        {m.email && (
                          <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <p className="text-xs text-muted-foreground">
            {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
            Agregar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}