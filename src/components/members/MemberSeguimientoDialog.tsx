import { useState, useEffect, useRef } from 'react';
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
import { Plus, UserCheck, Trash2, Clock, Search, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

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

interface SystemUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
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
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({ responsable: '', nota: '' });

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SystemUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search profiles when typing
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .ilike('display_name', `%${searchQuery}%`)
        .limit(6);
      setSuggestions(data ?? []);
      setShowSuggestions(true);
      setSearching(false);
    }, 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selectUser = (u: SystemUser) => {
    setSelectedUser(u);
    setForm(p => ({ ...p, responsable: u.display_name ?? u.email ?? '' }));
    setSearchQuery(u.display_name ?? u.email ?? '');
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setForm(p => ({ ...p, responsable: '' }));
    setSuggestions([]);
  };

  const handleAdd = async () => {
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

    // Send notification to selected user if they have an account
    if (selectedUser?.user_id) {
      try {
        await sendNotification(selectedUser.user_id, {
          type: 'seguimiento',
          message: `Fuiste asignado como Responsable en el seguimiento de ${member.firstName} ${member.lastName}`,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          from: currentUser?.email ?? getCurrentUser(),
          link: '/members',
        });
      } catch (e) {
        console.error('Error sending notification', e);
      }
    }

    setForm({ responsable: '', nota: '' });
    setSearchQuery('');
    setSelectedUser(null);
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

            {/* Responsable with search */}
            <div className="space-y-2" ref={containerRef}>
              <Label htmlFor="member-seg-responsable">Responsable *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="member-seg-responsable"
                  className="pl-9 pr-9"
                  placeholder="Buscar por nombre de usuario..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setSelectedUser(null);
                    setForm(p => ({ ...p, responsable: e.target.value }));
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {searchQuery && !searching && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={clearSelection}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                    {suggestions.map(u => (
                      <button
                        key={u.user_id}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                        onMouseDown={e => { e.preventDefault(); selectUser(u); }}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.display_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        {selectedUser?.user_id === u.user_id && (
                          <span className="ml-auto text-xs text-primary font-medium">Seleccionado</span>
                        )}
                      </button>
                    ))}
                    {suggestions.length === 0 && !searching && searchQuery.length > 0 && (
                      <p className="px-3 py-3 text-sm text-muted-foreground">No se encontraron usuarios</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected user chip */}
              {selectedUser && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs w-fit">
                  <UserCheck className="w-3 h-3" />
                  <span className="font-medium">{selectedUser.display_name}</span>
                  <span className="opacity-60">— recibirá una notificación 🔔</span>
                </div>
              )}
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
