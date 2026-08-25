import { useState, useMemo, useCallback } from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberFilters } from '@/components/members/MemberFilters';
import { AddMemberDialog } from '@/components/members/AddMemberDialog';
import { EditMemberDialog } from '@/components/members/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/members/DeleteMemberDialog';
import { MemberSeguimientoDialog } from '@/components/members/MemberSeguimientoDialog';
import type { MemberSeguimiento, MemberSeguimientoMap } from '@/components/members/MemberSeguimientoDialog';
import { AssignTagsDialog } from '@/components/tags/AssignTagsDialog';
import { useMembers } from '@/contexts/MembersContext';
import { useDbStorage } from '@/hooks/useDbStorage';
import { usePermissions, getMembersPermissions } from '@/hooks/usePermissions';
import { Member, Tag } from '@/types';
import { Users } from 'lucide-react';

import { toast } from '@/hooks/use-toast';

export default function Members() {
  const { members, addMember, updateMember, deleteMember, addTagToMember, removeTagFromMember } = useMembers();
  const permState = usePermissions();
  const memberPerms = getMembersPermissions(permState);
  const { value: seguimientosMap, setValue: setSeguimientosMap } = useDbStorage<MemberSeguimientoMap>(
    'member-seguimientos',
    {},
    'members'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [etapaFilter, setEtapaFilter] = useState('all');
  const [sexoFilter, setSexoFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSeguimientoOpen, setIsSeguimientoOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        searchQuery === '' ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesEtapa = etapaFilter === 'all' || member.etapa === etapaFilter;
      const matchesSexo = sexoFilter === 'all' || member.sexo === sexoFilter;
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.every((tagId) => member.tags.some((t) => t.id === tagId));

      return matchesSearch && matchesStatus && matchesEtapa && matchesSexo && matchesTags;
    });
  }, [members, searchQuery, statusFilter, etapaFilter, sexoFilter, tagFilter]);

  const handleAddMember = (data: any) => {
    const newMember: Member = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      status: data.status,
      role: data.role,
      tags: [],
      notes: data.notes,
      petitions: data.petitions || undefined,
      etapa: data.etapa || undefined,
      sexo: data.sexo || undefined,
      zona: data.zona || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addMember(newMember);
  };

  const handleEditMember = (id: string, data: any) => {
    updateMember(id, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      conversionDate: data.conversionDate || undefined,
      baptismDate: data.baptismDate || undefined,
      status: data.status,
      role: data.role,
      etapa: data.etapa || undefined,
      sexo: data.sexo || undefined,
      zona: data.zona || undefined,
      notes: data.notes,
      petitions: data.petitions || undefined,
    });
    toast({
      title: '¡Miembro actualizado!',
      description: `${data.firstName} ${data.lastName} fue actualizado exitosamente.`,
    });
  };

  const handleDeleteMember = () => {
    if (selectedMember) {
      deleteMember(selectedMember.id);
      toast({
        title: 'Miembro eliminado',
        description: `${selectedMember.firstName} ${selectedMember.lastName} fue eliminado de la lista.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const openSeguimientoDialog = (member: Member) => {
    setSelectedMember(member);
    setIsSeguimientoOpen(true);
  };

  const openTagsDialog = (member: Member) => {
    setSelectedMember(member);
    setIsTagsDialogOpen(true);
  };

  const handleAssignTag = async (tag: Tag) => {
    if (!selectedMember) return;
    await addTagToMember(selectedMember.id, tag);
    setSelectedMember((prev) =>
      prev ? { ...prev, tags: [...prev.tags, tag] } : prev
    );
    toast({
      title: '¡Etiqueta asignada!',
      description: `"${tag.name}" fue asignada a ${selectedMember.firstName}.`,
    });
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!selectedMember) return;
    await removeTagFromMember(selectedMember.id, tagId);
    setSelectedMember((prev) =>
      prev ? { ...prev, tags: prev.tags.filter((t) => t.id !== tagId) } : prev
    );
  };

  const handleViewMember = (member: Member) => {
    toast({
      title: `Perfil: ${member.firstName} ${member.lastName}`,
      description: `Telefone: ${member.phone}${member.email ? ` | Email: ${member.email}` : ''}${member.etapa ? ` | Etapa: ${member.etapa}` : ''}`,
    });
  };

  const handleAddSeguimiento = useCallback(
    (memberId: string, seguimiento: MemberSeguimiento) => {
      setSeguimientosMap((prev) => {
        const existing = prev[memberId] || [];
        return { ...prev, [memberId]: [seguimiento, ...existing] };
      });
    },
    [setSeguimientosMap]
  );

  const handleDeleteSeguimiento = useCallback(
    (memberId: string, seguimientoId: string) => {
      setSeguimientosMap((prev) => {
        const existing = prev[memberId] || [];
        return { ...prev, [memberId]: existing.filter((s) => s.id !== seguimientoId) };
      });
    },
    [setSeguimientosMap]
  );

  const getSeguimientosForMember = (memberId: string): MemberSeguimiento[] => {
    return seguimientosMap[memberId] || [];
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunidad</h1>
              <p className="text-muted-foreground">
                Administre todos los miembros de la comunidad ({members.length} total
                {filteredMembers.length !== members.length ? `, ${filteredMembers.length} filtrados` : ''})
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <MemberFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          etapaFilter={etapaFilter}
          onEtapaChange={setEtapaFilter}
          sexoFilter={sexoFilter}
          onSexoChange={setSexoFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          onAddMember={() => setIsAddDialogOpen(true)}
          canCreate={memberPerms.canCreate}
        />

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => {
            const memberSeguimientos = getSeguimientosForMember(member.id);
            return (
              <div
                key={member.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MemberCard
                  member={member}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onView={handleViewMember}
                  onSeguimiento={openSeguimientoDialog}
                  onAssignTags={openTagsDialog}
                  seguimientoCount={memberSeguimientos.length}
                  lastSeguimiento={memberSeguimientos.length > 0 ? memberSeguimientos[0] : null}
                  canEdit={memberPerms.canEdit}
                  canDelete={memberPerms.canDelete}
                />
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ningún miembro encontrado
            </h3>
            <p className="text-muted-foreground">
              Intente ajustar los filtros o agregue un nuevo miembro.
            </p>
          </div>
        )}

        {/* Add Member Dialog */}
        <AddMemberDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddMember}
        />

        {/* Edit Member Dialog */}
        <EditMemberDialog
          member={selectedMember}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditMember}
        />

        {/* Delete Member Dialog */}
        <DeleteMemberDialog
          member={selectedMember}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteMember}
        />

        {/* Seguimiento Dialog */}
        <MemberSeguimientoDialog
          member={selectedMember}
          open={isSeguimientoOpen}
          onOpenChange={setIsSeguimientoOpen}
          seguimientos={selectedMember ? getSeguimientosForMember(selectedMember.id) : []}
          onAddSeguimiento={handleAddSeguimiento}
          onDeleteSeguimiento={handleDeleteSeguimiento}
        />

        {/* Assign Tags Dialog */}
        <AssignTagsDialog
          open={isTagsDialogOpen}
          onOpenChange={setIsTagsDialogOpen}
          entityName={selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : ''}
          assignedTags={selectedMember?.tags ?? []}
          onAssign={handleAssignTag}
          onRemove={handleRemoveTag}
        />
      </div>
    </MainLayout>
  );
}

