import { useState } from 'react';
import { useDbStorage } from '@/hooks/useDbStorage';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { HandHeart, Users, Clock, Plus, Calendar, BookOpen, Megaphone, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PLCGroup } from '@/types';
import { PLCCard } from '@/components/plc/PLCCard';
import { AddPLCDialog } from '@/components/plc/AddPLCDialog';
import { EditPLCDialog } from '@/components/plc/EditPLCDialog';
import { DeletePLCDialog } from '@/components/plc/DeletePLCDialog';
import { AddMemberToPLCDialog } from '@/components/plc/AddMemberToPLCDialog';
import { PLCDetailsDialog } from '@/components/plc/PLCDetailsDialog';
import { PLCCalendarDialog } from '@/components/plc/PLCCalendarDialog';
import { PLCProgramDialog } from '@/components/plc/PLCProgramDialog';
import { PLCAnunciosDialog } from '@/components/plc/PLCAnunciosDialog';
import { useMembers } from '@/contexts/MembersContext';

export default function PLC() {
  const { value: groups, setValue: setGroups } = useDbStorage<PLCGroup[]>('plc_groups_list', []);
  const { members, addTagToMember, updateMember, getMembroPLCTag } = useMembers();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [anunciosDialogOpen, setAnunciosDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PLCGroup | null>(null);

  const getLeader = (leaderId: string) => members.find(m => m.id === leaderId);

  const handleAddGroup = (newGroup: PLCGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleEditGroup = (updatedGroup: PLCGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  const handleDeleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddMemberToGroup = (groupId: string, memberId: string) => {
    // Adiciona membro ao grupo
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: [...g.members, memberId] }
          : g
      )
    );

    // Sempre persiste o grupo do membro no banco (atualiza el dashboard)
    updateMember(memberId, { plcGroupId: groupId });

    // Adiciona a tag "Membro PLC" ao membro (se existir e ainda não tiver)
    const membroPLCTag = getMembroPLCTag();
    if (membroPLCTag) {
      addTagToMember(memberId, membroPLCTag);
    }
  };

  const openEditDialog = (group: PLCGroup) => {
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (group: PLCGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const openAddMemberDialog = (group: PLCGroup) => {
    setSelectedGroup(group);
    setAddMemberDialogOpen(true);
  };

  const openDetailsDialog = (group: PLCGroup) => {
    setSelectedGroup(group);
    setDetailsDialogOpen(true);
  };

  const activeGroups = groups.filter((g) => g.isActive).length;
  const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10">
              <HandHeart className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PLCs</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestione los grupos pequeños de la iglesia
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm border-success/30 text-success hover:bg-success/10"
              onClick={() => navigate('/resumen-plc')}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="truncate">Resumen</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => setCalendarDialogOpen(true)}>
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">Calendario</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => setProgramDialogOpen(true)}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Programa</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => setAnunciosDialogOpen(true)}>
              <Megaphone className="w-4 h-4 shrink-0" />
              <span className="truncate">Anuncio</span>
            </Button>
            <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <HandHeart className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeGroups}</p>
                <p className="text-sm text-muted-foreground">PLCs activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">Participantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Viernes</p>
                <p className="text-sm text-muted-foreground">Día de reunión</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PLC Groups Grid */}
        {groups.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <HandHeart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Ningún PLC registrado
                </h3>
                <p className="text-muted-foreground mt-1">
                  Haga clic en "Nuevo PLC" para añadir el primer PLC.
                </p>
              </div>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo PLC
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group, index) => (
              <PLCCard
                key={group.id}
                group={group}
                leader={getLeader(group.leaderId)}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onAddMember={openAddMemberDialog}
                onViewDetails={openDetailsDialog}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddPLCDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddGroup}
        members={members}
      />
      <EditPLCDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEdit={handleEditGroup}
        group={selectedGroup}
        members={members}
      />
      <DeletePLCDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteGroup}
        group={selectedGroup}
      />
      <AddMemberToPLCDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        group={selectedGroup}
        allMembers={members}
        onAddMember={handleAddMemberToGroup}
      />
      <PLCDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        group={selectedGroup}
        leader={selectedGroup ? getLeader(selectedGroup.leaderId) : undefined}
        members={members}
      />
      <PLCCalendarDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
      />
      <PLCProgramDialog
        open={programDialogOpen}
        onOpenChange={setProgramDialogOpen}
      />
      <PLCAnunciosDialog
        open={anunciosDialogOpen}
        onOpenChange={setAnunciosDialogOpen}
      />
    </MainLayout>
  );
}
