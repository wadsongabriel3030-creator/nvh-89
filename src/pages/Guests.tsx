import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Phone, User, FileText, Clock, MoreVertical, Edit, Trash2, UserCheck, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useMembers } from '@/contexts/MembersContext';

interface Guest {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  petitions?: string;
  status: 'aguardando' | 'contatado' | 'visitou' | 'membro';
  createdAt: string;
  notes?: string;
  seguimientos?: Seguimiento[];
}

interface Seguimiento {
  id: string;
  responsable: string;
  nota: string;
  createdBy: string;
  createdAt: string;
}

// Preparado para futura autenticación. Reemplazar por usuario autenticado cuando exista login.
function getCurrentUser(): string {
  try {
    return localStorage.getItem('current-user-name') || 'Equipo Pastoral';
  } catch {
    return 'Equipo Pastoral';
  }
}

const statusLabels: Record<Guest['status'], string> = {
  aguardando: 'En espera',
  contatado: 'Contactado',
  visitou: 'Visitó',
  membro: 'Se hizo Miembro',
};

const statusColors: Record<Guest['status'], string> = {
  aguardando: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  contatado: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  visitou: 'bg-green-500/20 text-green-600 border-green-500/30',
  membro: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

export default function Guests() {
  const { value: guests, setValue: setGuests, loading } = useDbStorage<Guest[]>('guests', [], 'guests');
  const { members } = useMembers();

  // Invitados from members context (registered via member form with status 'visitor' = Invitado)
  const invitadosFromMembers = members.filter((m) => m.status === 'visitor');

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isSeguimientoOpen, setIsSeguimientoOpen] = useState(false);
  const [seguimientoForm, setSeguimientoForm] = useState({ responsable: '', nota: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    petitions: '',
    status: 'aguardando' as Guest['status'],
    notes: '',
  });

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({
      name: '',
      nickname: '',
      phone: '',
      petitions: '',
      status: 'aguardando',
      notes: '',
    });
  };

  const handleAddGuest = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      nickname: formData.nickname.trim() || undefined,
      phone: formData.phone.trim(),
      petitions: formData.petitions.trim() || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setGuests((prev) => [...prev, newGuest]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('¡Invitado registrado exitosamente!');
  };

  const handleEditGuest = () => {
    if (!selectedGuest) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    setGuests((prev) =>
      prev.map((guest) =>
        guest.id === selectedGuest.id
          ? {
              ...guest,
              name: formData.name.trim(),
              nickname: formData.nickname.trim() || undefined,
              phone: formData.phone.trim(),
              petitions: formData.petitions.trim() || undefined,
              status: formData.status,
              notes: formData.notes.trim() || undefined,
            }
          : guest
      )
    );
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedGuest(null);
    toast.success('¡Invitado actualizado exitosamente!');
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
    toast.success('¡Invitado eliminado exitosamente!');
  };

  const openSeguimientoDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setSeguimientoForm({ responsable: '', nota: '' });
    setIsSeguimientoOpen(true);
  };

  const handleAddSeguimiento = () => {
    if (!selectedGuest) return;
    if (!seguimientoForm.responsable.trim() || !seguimientoForm.nota.trim()) {
      toast.error('Responsable y nota son obligatorios');
      return;
    }
    const nuevo: Seguimiento = {
      id: Date.now().toString(),
      responsable: seguimientoForm.responsable.trim(),
      nota: seguimientoForm.nota.trim(),
      createdBy: getCurrentUser(),
      createdAt: new Date().toISOString(),
    };
    setGuests((prev) =>
      prev.map((g) =>
        g.id === selectedGuest.id
          ? { ...g, seguimientos: [nuevo, ...(g.seguimientos || [])] }
          : g
      )
    );
    setSelectedGuest((prev) =>
      prev ? { ...prev, seguimientos: [nuevo, ...(prev.seguimientos || [])] } : prev
    );
    setSeguimientoForm({ responsable: '', nota: '' });
    toast.success('¡Seguimiento registrado!');
  };

  const handleDeleteSeguimiento = (seguimientoId: string) => {
    if (!selectedGuest) return;
    setGuests((prev) =>
      prev.map((g) =>
        g.id === selectedGuest.id
          ? { ...g, seguimientos: (g.seguimientos || []).filter((s) => s.id !== seguimientoId) }
          : g
      )
    );
    setSelectedGuest((prev) =>
      prev
        ? { ...prev, seguimientos: (prev.seguimientos || []).filter((s) => s.id !== seguimientoId) }
        : prev
    );
  };

  const openEditDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData({
      name: guest.name,
      nickname: guest.nickname || '',
      phone: guest.phone,
      petitions: guest.petitions || '',
      status: guest.status,
      notes: guest.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invitados</h1>
            <p className="text-muted-foreground mt-1">
              Administre los invitados y visitantes de la iglesia
            </p>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar invitados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Invitado
          </Button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Guests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuests.map((guest) => (
                <Card key={guest.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{guest.name}</CardTitle>
                        {guest.nickname && (
                          <p className="text-sm text-muted-foreground">
                            "{guest.nickname}"
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(guest)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openSeguimientoDialog(guest)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Seguimientos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{guest.phone}</span>
                    </div>
                    {guest.petitions && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground line-clamp-2">
                          {guest.petitions}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <Badge className={statusColors[guest.status]} variant="outline">
                        {statusLabels[guest.status]}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(guest.createdAt).toLocaleDateString('es')}
                      </div>
                    </div>
                    {guest.seguimientos && guest.seguimientos.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                          <UserCheck className="h-3 w-3 text-primary" />
                          Último seguimiento
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          <span className="font-medium text-foreground">
                            {guest.seguimientos[0].responsable}:
                          </span>{' '}
                          {guest.seguimientos[0].nota}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => openSeguimientoDialog(guest)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      Seguimientos ({guest.seguimientos?.length || 0})
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGuests.length === 0 && invitadosFromMembers.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  Ningún invitado encontrado
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? 'Intente buscar con otros términos'
                    : 'Agregue el primer invitado haciendo clic en el botón de arriba'}
                </p>
              </div>
            )}

            {/* Invitados from Members (registered via member form) */}
            {invitadosFromMembers.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  Invitados registrados como miembros ({invitadosFromMembers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invitadosFromMembers
                    .filter((m) =>
                      searchQuery === '' ||
                      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.phone.includes(searchQuery)
                    )
                    .map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow border-orange-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                            <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30" variant="outline">
                              Invitado
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{member.phone || 'Sin teléfono'}</span>
                        </div>
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{member.email}</span>
                          </div>
                        )}
                        {member.zona && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{member.zona}</span>
                          </div>
                        )}
                        {member.etapa && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Etapa: {member.etapa}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                          <Clock className="h-3 w-3" />
                          {new Date(member.createdAt).toLocaleDateString('es')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Invitado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">¿Quién te invitó?</Label>
                <Input
                  id="nickname"
                  placeholder="¿Quién te invitó? (opcional)"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  placeholder="(502) 0000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petitions">Peticiones</Label>
                <Textarea
                  id="petitions"
                  placeholder="Pedidos de oración, necesidades..."
                  value={formData.petitions}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, petitions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddGuest}>Registrar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Invitado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nickname">¿Quién te invitó?</Label>
                <Input
                  id="edit-nickname"
                  placeholder="¿Quién te invitó? (opcional)"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono *</Label>
                <Input
                  id="edit-phone"
                  placeholder="(502) 0000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-petitions">Peticiones</Label>
                <Textarea
                  id="edit-petitions"
                  placeholder="Pedidos de oración, necesidades..."
                  value={formData.petitions}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, petitions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Guest['status']) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">En espera</SelectItem>
                    <SelectItem value="contatado">Contactado</SelectItem>
                    <SelectItem value="visitou">Visitó</SelectItem>
                    <SelectItem value="membro">Se hizo Miembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observaciones</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsEditDialogOpen(false);
                    setSelectedGuest(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleEditGuest}>Guardar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Seguimientos Dialog */}
        <Dialog open={isSeguimientoOpen} onOpenChange={setIsSeguimientoOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Seguimientos {selectedGuest ? `– ${selectedGuest.name}` : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
                <p className="text-sm font-medium text-foreground">Registrar nuevo seguimiento</p>
                <div className="space-y-2">
                  <Label htmlFor="seg-responsable">Responsable *</Label>
                  <Input
                    id="seg-responsable"
                    placeholder="Ej: Pastor Renato"
                    value={seguimientoForm.responsable}
                    onChange={(e) =>
                      setSeguimientoForm((p) => ({ ...p, responsable: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seg-nota">Nota *</Label>
                  <Textarea
                    id="seg-nota"
                    placeholder="Ej: Renato da seguimiento a esta persona, ya la llamó el lunes..."
                    value={seguimientoForm.nota}
                    onChange={(e) =>
                      setSeguimientoForm((p) => ({ ...p, nota: e.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddSeguimiento}>
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
                  Historial ({selectedGuest?.seguimientos?.length || 0})
                </p>
                {(!selectedGuest?.seguimientos || selectedGuest.seguimientos.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aún no hay seguimientos registrados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedGuest!.seguimientos!.map((s) => (
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
                            onClick={() => handleDeleteSeguimiento(s.id)}
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
      </div>
    </MainLayout>
  );
}