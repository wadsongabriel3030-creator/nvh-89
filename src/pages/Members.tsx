import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberFilters } from '@/components/members/MemberFilters';
import { AddMemberDialog } from '@/components/members/AddMemberDialog';
import { EditMemberDialog } from '@/components/members/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/members/DeleteMemberDialog';
import { useMembers } from '@/contexts/MembersContext';
import { Member } from '@/types';
import { Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [etapaFilter, setEtapaFilter] = useState('all');
  const [sexoFilter, setSexoFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

      return matchesSearch && matchesStatus && matchesEtapa && matchesSexo;
    });
  }, [members, searchQuery, statusFilter, etapaFilter, sexoFilter]);

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
      etapa: data.etapa || undefined,
      sexo: data.sexo || undefined,
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
      notes: data.notes,
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

  const handleViewMember = (member: Member) => {
    toast({
      title: `Perfil: ${member.firstName} ${member.lastName}`,
      description: `Telefone: ${member.phone}${member.email ? ` | Email: ${member.email}` : ''}${member.etapa ? ` | Etapa: ${member.etapa}` : ''}`,
    });
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
              <h1 className="text-3xl font-bold text-foreground">Miembros</h1>
              <p className="text-muted-foreground">
                Administre todos los miembros de la iglesia ({members.length} total
                {filteredMembers.length !== members.length ? `, ${filteredMembers.length} filtrados` : ''})
              </p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link to="/reporte-dominical">
              <ClipboardList className="w-4 h-4" />
              Reporte Dominical
            </Link>
          </Button>
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
          onAddMember={() => setIsAddDialogOpen(true)}
        />

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
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
              />
            </div>
          ))}
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
      </div>
    </MainLayout>
  );
}
