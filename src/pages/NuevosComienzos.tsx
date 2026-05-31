import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles, Plus, Users, CheckCircle, Clock, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CURSO_MEMBRESIA = {
  id: 'membresia',
  nombre: 'Vida Nuevos Hechos',
  descripcion: 'Curso de membresía para nuevos integrantes de la iglesia',
  totalLabel: '1 LECCIÓN',
  color: 'text-primary',
  lecciones: ['Vida Nuevos Hechos'],
};
import { NuevosComienzosParticipant } from '@/types';
import { mockMembers } from '@/lib/mock-data';
import { ParticipantCard } from '@/components/nuevos-comienzos/ParticipantCard';
import { AddParticipantDialog } from '@/components/nuevos-comienzos/AddParticipantDialog';
import { EditParticipantDialog } from '@/components/nuevos-comienzos/EditParticipantDialog';
import { DeleteParticipantDialog } from '@/components/nuevos-comienzos/DeleteParticipantDialog';

const initialParticipants: NuevosComienzosParticipant[] = [
  { id: '1', memberId: '4', startDate: '2024-01-15', status: 'in_progress' },
  { id: '2', memberId: '5', startDate: '2024-01-08', completionDate: '2024-02-08', status: 'completed' },
];

export default function NuevosComienzos() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<NuevosComienzosParticipant[]>(initialParticipants);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<NuevosComienzosParticipant | null>(null);
  const [reporteOpen, setReporteOpen] = useState(false);

  const getMember = (memberId: string) => mockMembers.find(m => m.id === memberId);

  const handleAdd = (participant: NuevosComienzosParticipant) => {
    setParticipants(prev => [...prev, participant]);
  };

  const handleEdit = (updated: NuevosComienzosParticipant) => {
    setParticipants(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDelete = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const openEditDialog = (participant: NuevosComienzosParticipant) => {
    setSelectedParticipant(participant);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (participant: NuevosComienzosParticipant) => {
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
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vida Nuevos Hechos</h1>
              <p className="text-muted-foreground">Acompanhe os novos convertidos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Adicionar Participante
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open('/inscripcion-vida-nuevos', '_blank')}>
              <Sparkles className="w-4 h-4" />
              INSCRÍBETE
            </Button>
            <Button variant="outline" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10" onClick={() => window.open('/compromiso-vnh', '_blank')}>
              <CheckCircle className="w-4 h-4" />
              Compromiso VNH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-500" />
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
                <p className="text-sm text-muted-foreground">Em andamento</p>
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
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Curso card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg bg-muted text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {CURSO_MEMBRESIA.totalLabel}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-3">{CURSO_MEMBRESIA.nombre}</CardTitle>
              <CardDescription>{CURSO_MEMBRESIA.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lecciones
                </p>
                <ul className="space-y-1">
                  {CURSO_MEMBRESIA.lecciones.map((l) => (
                    <li key={l} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => navigate('/reporte-membresia')}
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

      <AddParticipantDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
        members={mockMembers}
        existingParticipantIds={participants.map(p => p.memberId)}
      />
      <EditParticipantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEdit={handleEdit}
        participant={selectedParticipant}
      />
      <DeleteParticipantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        participant={selectedParticipant}
        member={selectedParticipant ? getMember(selectedParticipant.memberId) : undefined}
      />
    </MainLayout>
  );
}
