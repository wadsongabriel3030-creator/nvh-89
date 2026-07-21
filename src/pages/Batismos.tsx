import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Droplets, Plus, Users, Calendar, CheckCircle, FileText, Loader2, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { BaptismRow, BatismoCard } from '@/components/batismos/BatismoCard';
import { AddBatismoDialog, AddBatismoPayload } from '@/components/batismos/AddBatismoDialog';
import { EditBatismoDialog } from '@/components/batismos/EditBatismoDialog';
import { DeleteBatismoDialog } from '@/components/batismos/DeleteBatismoDialog';

interface InscripcionReport {
  id: string;
  leader_name: string | null;
  report_date: string | null;
  created_at: string;
  extra: {
    fullName?: string;
    phone?: string;
    email?: string;
    receivedChrist?: boolean | null;
    attendedMembership?: boolean | null;
  } | null;
}

export default function Batismos() {
  const navigate = useNavigate();

  // ── Baptisms state ──
  const [records, setRecords] = useState<BaptismRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BaptismRow | null>(null);

  // ── Inscription reports state ──
  const [inscriptions, setInscriptions] = useState<InscripcionReport[]>([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(true);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  // ── Load baptisms from Supabase ──
  const loadBaptisms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('baptisms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error al cargar bautismos');
    } else {
      setRecords((data ?? []) as BaptismRow[]);
    }
    setLoading(false);
  }, []);

  // ── Load inscription reports from class_reports ──
  const loadInscriptions = useCallback(async () => {
    setLoadingInscriptions(true);
    const { data, error } = await supabase
      .from('class_reports')
      .select('id, leader_name, report_date, created_at, extra')
      .eq('area', 'inscripcion-bautismo')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error al cargar reportes de inscripción');
    } else {
      setInscriptions((data ?? []) as InscripcionReport[]);
    }
    setLoadingInscriptions(false);
  }, []);

  useEffect(() => {
    loadBaptisms();
    loadInscriptions();
  }, [loadBaptisms, loadInscriptions]);

  // ── CRUD handlers ──
  const handleAdd = async (payload: AddBatismoPayload) => {
    const { data, error } = await supabase
      .from('baptisms')
      .insert({
        full_name: payload.full_name,
        scheduled_date: payload.scheduled_date,
        location: payload.location || null,
        status: 'scheduled' as const,
      })
      .select('*')
      .single();
    if (error) throw error;
    setRecords(prev => [data as BaptismRow, ...prev]);
  };

  const handleEdit = async (updated: BaptismRow) => {
    const { error } = await supabase
      .from('baptisms')
      .update({
        full_name: updated.full_name,
        scheduled_date: updated.scheduled_date,
        completed_date: updated.completed_date,
        status: updated.status,
        location: updated.location,
      })
      .eq('id', updated.id);
    if (error) throw error;
    setRecords(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('baptisms').delete().eq('id', id);
    if (error) throw error;
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteReport = async (id: string) => {
    const { error } = await supabase.from('class_reports').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar reporte');
      return;
    }
    setInscriptions(prev => prev.filter(r => r.id !== id));
    toast.success('Reporte eliminado');
    setDeleteReportId(null);
  };

  const openEditDialog = (record: BaptismRow) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (record: BaptismRow) => {
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
              <h1 className="text-3xl font-bold text-foreground">Bautismos</h1>
              <p className="text-muted-foreground">Administre los bautismos de la iglesia</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/inscripcion-bautismo')}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Formulario de Inscripción</span>
              <span className="sm:hidden">Inscripción</span>
            </Button>
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agendar Bautismo</span>
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

        {/* Tabs: Bautismos agendados / Reportes de Inscripción */}
        <Tabs defaultValue="bautismos" className="w-full">
          <TabsList>
            <TabsTrigger value="bautismos" className="gap-2">
              <Droplets className="w-4 h-4" />
              Bautismos Agendados
            </TabsTrigger>
            <TabsTrigger value="reportes" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Reportes de Inscripción
              {inscriptions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {inscriptions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Bautismos Agendados ── */}
          <TabsContent value="bautismos" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : records.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Droplets className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Ningún bautismo registrado</h3>
                    <p className="text-muted-foreground mt-1">Haga clic en "Agendar Bautismo" para comenzar.</p>
                  </div>
                  <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Bautismo
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record, index) => (
                  <BatismoCard
                    key={record.id}
                    record={record}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Reportes de Inscripción ── */}
          <TabsContent value="reportes" className="mt-4">
            {loadingInscriptions ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : inscriptions.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted">
                    <ClipboardList className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Sin reportes de inscripción</h3>
                    <p className="text-muted-foreground mt-1">
                      Los reportes aparecerán aquí cuando alguien complete el formulario de inscripción de bautismo.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/inscripcion-bautismo')} className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Ir al Formulario
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>¿Recibió a Cristo?</TableHead>
                        <TableHead>¿Curso Membresía?</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscriptions.map(report => {
                        const extra = report.extra ?? {};
                        return (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {extra.fullName || report.leader_name || '—'}
                            </TableCell>
                            <TableCell>{extra.phone || '—'}</TableCell>
                            <TableCell>{extra.email || '—'}</TableCell>
                            <TableCell>
                              {extra.receivedChrist === true ? (
                                <Badge className="bg-success/10 text-success border-0">Sí</Badge>
                              ) : extra.receivedChrist === false ? (
                                <Badge className="bg-destructive/10 text-destructive border-0">No</Badge>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              {extra.attendedMembership === true ? (
                                <Badge className="bg-success/10 text-success border-0">Sí</Badge>
                              ) : extra.attendedMembership === false ? (
                                <Badge className="bg-destructive/10 text-destructive border-0">No</Badge>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              {report.report_date
                                ? format(new Date(report.report_date + 'T12:00:00'), 'dd/MM/yyyy')
                                : report.created_at
                                  ? format(new Date(report.created_at), 'dd/MM/yyyy')
                                  : '—'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteReportId(report.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddBatismoDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
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
      />

      {/* Delete report confirmation */}
      <AlertDialog open={!!deleteReportId} onOpenChange={open => { if (!open) setDeleteReportId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Reporte</AlertDialogTitle>
            <AlertDialogDescription>¿Estás seguro de que deseas eliminar este reporte de inscripción?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReportId && handleDeleteReport(deleteReportId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
