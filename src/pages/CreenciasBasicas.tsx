import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Heart, Plus, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreenciasBasicasParticipant } from '@/types';
import { mockMembers } from '@/lib/mock-data';
import { CreenciasCard } from '@/components/creencias-basicas/CreenciasCard';
import { AddCreenciasDialog } from '@/components/creencias-basicas/AddCreenciasDialog';
import { EditCreenciasDialog } from '@/components/creencias-basicas/EditCreenciasDialog';
import { DeleteCreenciasDialog } from '@/components/creencias-basicas/DeleteCreenciasDialog';

const initialParticipants: CreenciasBasicasParticipant[] = [
  { id: '1', memberId: '2', startDate: '2024-01-05', status: 'in_progress' },
  { id: '2', memberId: '4', startDate: '2023-12-01', completionDate: '2024-01-15', status: 'completed' },
];

export default function CreenciasBasicas() {
  const [participants, setParticipants] = useState<CreenciasBasicasParticipant[]>(initialParticipants);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<CreenciasBasicasParticipant | null>(null);

  const getMember = (memberId: string) => mockMembers.find(m => m.id === memberId);

  const handleAdd = (participant: CreenciasBasicasParticipant) => {
    setParticipants(prev => [...prev, participant]);
  };

  const handleEdit = (updated: CreenciasBasicasParticipant) => {
    setParticipants(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDelete = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const openEditDialog = (participant: CreenciasBasicasParticipant) => {
    setSelectedParticipant(participant);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (participant: CreenciasBasicasParticipant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };

  const inProgressCount = participants.filter(p => p.status === 'in_progress').length;
  const completedCount = participants.filter(p => p.status === 'completed').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/10">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Creencias Básicas</h1>
              <p className="text-muted-foreground">Seguimiento de los participantes del curso</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Agregar Participante
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-pink-500/5 border-pink-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{participants.length}</p>
                <p className="text-sm text-muted-foreground">Total de participantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">En progreso</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {participants.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ningún participante registrado</h3>
                <p className="text-muted-foreground mt-1">Haga clic en "Agregar Participante" para comenzar.</p>
              </div>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Participante
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant, index) => (
              <CreenciasCard
                key={participant.id}
                participant={participant}
                member={getMember(participant.memberId)}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <AddCreenciasDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
        members={mockMembers}
        existingParticipantIds={participants.map(p => p.memberId)}
      />
      <EditCreenciasDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEdit={handleEdit}
        participant={selectedParticipant}
      />
      <DeleteCreenciasDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        participant={selectedParticipant}
        member={selectedParticipant ? getMember(selectedParticipant.memberId) : undefined}
      />
    </MainLayout>
  );
}