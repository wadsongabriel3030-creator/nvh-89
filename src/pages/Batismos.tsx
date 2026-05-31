import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Droplets, Plus, Users, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BatismoRecord } from '@/types';
import { mockMembers } from '@/lib/mock-data';
import { BatismoCard } from '@/components/batismos/BatismoCard';
import { AddBatismoDialog } from '@/components/batismos/AddBatismoDialog';
import { EditBatismoDialog } from '@/components/batismos/EditBatismoDialog';
import { DeleteBatismoDialog } from '@/components/batismos/DeleteBatismoDialog';

const initialRecords: BatismoRecord[] = [
  { id: '1', memberId: '4', scheduledDate: '2024-02-15', status: 'scheduled', location: 'Igreja Central' },
  { id: '2', memberId: '2', scheduledDate: '2023-09-05', completedDate: '2023-09-05', status: 'completed', location: 'Igreja Central' },
];

export default function Batismos() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BatismoRecord[]>(initialRecords);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BatismoRecord | null>(null);

  const getMember = (memberId: string) => mockMembers.find(m => m.id === memberId);

  const handleAdd = (record: BatismoRecord) => {
    setRecords(prev => [...prev, record]);
  };

  const handleEdit = (updated: BatismoRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const openEditDialog = (record: BatismoRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (record: BatismoRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const scheduledCount = records.filter(r => r.status === 'scheduled').length;
  const completedCount = records.filter(r => r.status === 'completed').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <Droplets className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Batismos</h1>
              <p className="text-muted-foreground">Gerencie os batismos da igreja</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/inscripcion-bautismo')}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Formulário de Inscrição</span>
              <span className="sm:hidden">Inscrição</span>
            </Button>
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agendar Batismo</span>
              <span className="sm:hidden">Agendar</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-cyan-500/5 border-cyan-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Users className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total de registros</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
                <p className="text-sm text-muted-foreground">Agendados</p>
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
                <p className="text-sm text-muted-foreground">Realizados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {records.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Droplets className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nenhum batismo cadastrado</h3>
                <p className="text-muted-foreground mt-1">Clique em "Agendar Batismo" para começar.</p>
              </div>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Batismo
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record, index) => (
              <BatismoCard
                key={record.id}
                record={record}
                member={getMember(record.memberId)}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <AddBatismoDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
        members={mockMembers}
        existingRecordIds={records.map(r => r.memberId)}
      />
      <EditBatismoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEdit={handleEdit}
        record={selectedRecord}
      />
      <DeleteBatismoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        record={selectedRecord}
        member={selectedRecord ? getMember(selectedRecord.memberId) : undefined}
      />
    </MainLayout>
  );
}
