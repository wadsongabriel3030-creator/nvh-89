import { useState } from 'react';
import { Member } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, UserCheck, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export interface MemberSeguimiento {
  id: string;
  responsable: string;
  nota: string;
  createdBy: string;
  createdAt: string;
}

export interface MemberSeguimientoMap {
  [memberId: string]: MemberSeguimiento[];
}

function getCurrentUser(): string {
  try {
    return localStorage.getItem('current-user-name') || 'Equipo Pastoral';
  } catch {
    return 'Equipo Pastoral';
  }
}

interface MemberSeguimientoDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seguimientos: MemberSeguimiento[];
  onAddSeguimiento: (memberId: string, seguimiento: MemberSeguimiento) => void;
  onDeleteSeguimiento: (memberId: string, seguimientoId: string) => void;
}

export function MemberSeguimientoDialog({
  member,
  open,
  onOpenChange,
  seguimientos,
  onAddSeguimiento,
  onDeleteSeguimiento,
}: MemberSeguimientoDialogProps) {
  const [form, setForm] = useState({ responsable: '', nota: '' });

  const handleAdd = () => {
    if (!member) return;
    if (!form.responsable.trim() || !form.nota.trim()) {
      toast.error('Responsable y nota son obligatorios');
      return;
    }
    const nuevo: MemberSeguimiento = {
      id: Date.now().toString(),
      responsable: form.responsable.trim(),
      nota: form.nota.trim(),
      createdBy: getCurrentUser(),
      createdAt: new Date().toISOString(),
    };
    onAddSeguimiento(member.id, nuevo);
    setForm({ responsable: '', nota: '' });
    toast.success('¡Seguimiento registrado!');
  };

  const handleDelete = (seguimientoId: string) => {
    if (!member) return;
    onDeleteSeguimiento(member.id, seguimientoId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Seguimientos {member ? `– ${member.firstName} ${member.lastName}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
            <p className="text-sm font-medium text-foreground">Registrar nuevo seguimiento</p>
            <div className="space-y-2">
              <Label htmlFor="member-seg-responsable">Responsable *</Label>
              <Input
                id="member-seg-responsable"
                placeholder="Ej: Pastor Renato"
                value={form.responsable}
                onChange={(e) =>
                  setForm((p) => ({ ...p, responsable: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-seg-nota">Nota *</Label>
              <Textarea
                id="member-seg-nota"
                placeholder="Ej: Renato da seguimiento a esta persona, ya la llamó el lunes..."
                value={form.nota}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nota: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Registrado por: <span className="font-medium">{getCurrentUser()}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Historial ({seguimientos.length})
            </p>
            {seguimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aún no hay seguimientos registrados.
              </p>
            ) : (
              <div className="space-y-2">
                {seguimientos.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {s.responsable}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {s.nota}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(s.createdAt).toLocaleString('es')}
                      <span>•</span>
                      <span>por {s.createdBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
