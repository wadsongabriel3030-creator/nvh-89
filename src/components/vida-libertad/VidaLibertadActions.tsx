import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { UserPlus, ClipboardCheck, Search, Users } from 'lucide-react';
import { useMembers } from '@/contexts/MembersContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDbStorage } from '@/hooks/useDbStorage';

interface VidaLibertadActionsProps {
  groupName: string;
  storageKey: string;
}

interface EnrolledMember {
  id: string;
  name: string;
}

export function VidaLibertadActions({ groupName, storageKey }: VidaLibertadActionsProps) {
  const { members } = useMembers();

  const { value: enrolled, setValue: setEnrolled } = useDbStorage<EnrolledMember[]>(`vl-enrolled-${storageKey}`, []);
  const { value: attendanceHistory, setValue: setAttendanceHistory } = useDbStorage<
    { date: string; presentIds: string[] }[]
  >(`vl-attendance-${storageKey}`, []);

  const persistEnrolled = (next: EnrolledMember[]) => setEnrolled(next);
  const persistAttendance = (next: { date: string; presentIds: string[] }[]) => setAttendanceHistory(next);

  // Register dialog
  const [registerOpen, setRegisterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const enrolledSet = useMemo(() => new Set(enrolled.map((e) => e.id)), [enrolled]);
  const available = useMemo(() => {
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

  const toggleSelect = (id: string) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleRegister = () => {
    if (selectedIds.length === 0) {
      toast.error('Seleccione al menos un miembro');
      return;
    }
    const toAdd = selectedIds
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}`.trim() }));
    persistEnrolled([...enrolled, ...toAdd]);
    toast.success(`${toAdd.length} miembro(s) registrado(s) en ${groupName}`);
    setSelectedIds([]);
    setSearch('');
    setRegisterOpen(false);
  };

  // Attendance dialog
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const togglePresent = (id: string) =>
    setPresentIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleSaveAttendance = () => {
    if (enrolled.length === 0) {
      toast.error('No hay miembros registrados en este grupo');
      return;
    }
    persistAttendance([
      { date: attendanceDate, presentIds: [...presentIds] },
      ...attendanceHistory,
    ]);
    toast.success(
      `Asistencia registrada: ${presentIds.length}/${enrolled.length} presentes`
    );
    setPresentIds([]);
    setAttendanceOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => setRegisterOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Registrar miembro a clase
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setPresentIds([]);
            setAttendanceOpen(true);
          }}
          className="gap-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          Marcar presencia
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <Users className="w-3 h-3" />
          {enrolled.length} miembro(s) registrado(s)
        </Badge>
        {attendanceHistory.length > 0 && (
          <Badge variant="secondary">
            {attendanceHistory.length} registro(s) de asistencia
          </Badge>
        )}
      </div>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Registrar miembro - {groupName}
            </DialogTitle>
            <DialogDescription>
              Seleccione miembros para inscribir en este grupo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar miembro..."
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[320px] pr-3 rounded-md border border-border">
              {available.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground px-4">
                  No hay miembros disponibles.
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {available.map((m) => {
                    const checked = selectedIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleSelect(m.id)}
                        className={cn(
                          'flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors',
                          checked
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleSelect(m.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {m.firstName} {m.lastName}
                          </p>
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
              {selectedIds.length} seleccionado(s)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} disabled={selectedIds.length === 0}>
              Registrar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Marcar presencia - {groupName}
            </DialogTitle>
            <DialogDescription>
              Marque los miembros presentes en esta clase
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

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {presentIds.length} de {enrolled.length} presentes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPresentIds(
                    presentIds.length === enrolled.length ? [] : enrolled.map((e) => e.id)
                  )
                }
                disabled={enrolled.length === 0}
              >
                {presentIds.length === enrolled.length ? 'Limpiar' : 'Marcar todos'}
              </Button>
            </div>

            <ScrollArea className="h-[320px] pr-3 rounded-md border border-border">
              {enrolled.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground px-4">
                  No hay miembros registrados. Use "Registrar miembro a clase" primero.
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {enrolled.map((m) => {
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
                        <span className="flex-1 font-medium text-sm text-foreground">
                          {m.name}
                        </span>
                        {present && (
                          <Badge className="bg-success/15 text-success border-0">
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
            <Button onClick={handleSaveAttendance} disabled={enrolled.length === 0}>
              Guardar asistencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
