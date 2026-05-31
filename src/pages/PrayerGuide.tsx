import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BookOpen, 
  Search,
  Calendar,
  CheckCircle2,
  History,
  LayoutGrid,
  List,
  Filter,
  Sparkles
} from 'lucide-react';
import { usePrayerGuide } from '@/hooks/usePrayerGuide';
import { PrayerGuideCard } from '@/components/prayer-guide/PrayerGuideCard';
import { AddPrayerGuideDialog } from '@/components/prayer-guide/AddPrayerGuideDialog';
import { EditPrayerGuideDialog } from '@/components/prayer-guide/EditPrayerGuideDialog';
import { DeletePrayerGuideDialog } from '@/components/prayer-guide/DeletePrayerGuideDialog';
import { UploadPDFDialog } from '@/components/prayer-guide/UploadPDFDialog';
import { PrayerHistoryDialog } from '@/components/prayer-guide/PrayerHistoryDialog';
import { MarkCompleteDialog } from '@/components/prayer-guide/MarkCompleteDialog';
import { UserRoleSwitcher } from '@/components/prayer-guide/UserRoleSwitcher';
import { PrayerGuide } from '@/types';
import { toast } from 'sonner';

export default function PrayerGuidePage() {
  const {
    guides,
    progress,
    history,
    currentUser,
    isLoading,
    createGuide,
    updateGuide,
    deleteGuide,
    uploadPDF,
    downloadPDF,
    markAsCompleted,
    hasCompletedToday,
    getGuideProgress,
    getGuideHistory,
    canManageGuides,
    switchUser,
    getStats,
  } = usePrayerGuide();

  // Estados dos diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isMarkCompleteDialogOpen, setIsMarkCompleteDialogOpen] = useState(false);
  
  const [selectedGuide, setSelectedGuide] = useState<PrayerGuide | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const stats = getStats();

  // Filtrar guias
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = filterPeriod === 'all' || guide.period === filterPeriod;
    
    // Membros só veem guias ativos
    if (currentUser.role === 'member') {
      return matchesSearch && matchesPeriod && guide.isActive;
    }
    
    return matchesSearch && matchesPeriod;
  });

  // Handlers
  const handleAddGuide = (data: Omit<PrayerGuide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    createGuide(data);
    toast.success('Guia de oração criado com sucesso!');
  };

  const handleEditGuide = (id: string, data: Partial<PrayerGuide>) => {
    updateGuide(id, data);
    toast.success('Guia atualizado com sucesso!');
  };

  const handleDeleteGuide = () => {
    if (selectedGuide) {
      deleteGuide(selectedGuide.id);
      toast.success('Guia excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
    }
  };

  const handleUploadPDF = async (file: File) => {
    if (selectedGuide) {
      await uploadPDF(selectedGuide.id, file);
      toast.success('PDF enviado com sucesso!');
    }
  };

  const handleDownloadPDF = (guide: PrayerGuide) => {
    downloadPDF(guide);
    toast.success('Download iniciado!');
  };

  const handleMarkComplete = (notes?: string) => {
    if (selectedGuide) {
      markAsCompleted(selectedGuide.id, notes);
      toast.success('Oração registrada com sucesso!');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Guia de Oração
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie guias de oração e acompanhe o progresso espiritual dos membros
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserRoleSwitcher currentUser={currentUser} onSwitch={switchUser} />
            {canManageGuides() && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Guia
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalGuides}</p>
                  <p className="text-sm text-muted-foreground">Total de Guias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeGuides}</p>
                  <p className="text-sm text-muted-foreground">Guias Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <CheckCircle2 className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCompletions}</p>
                  <p className="text-sm text-muted-foreground">Total de Orações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <History className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.myCompletions}</p>
                  <p className="text-sm text-muted-foreground">Minhas Orações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar guias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as typeof filterPeriod)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="daily">Diário</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="hidden sm:flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Guides Grid */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {filteredGuides.map((guide) => (
            <PrayerGuideCard
              key={guide.id}
              guide={guide}
              progress={getGuideProgress(guide.id)}
              hasCompletedToday={hasCompletedToday(guide.id)}
              canManage={canManageGuides()}
              onEdit={() => {
                setSelectedGuide(guide);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => {
                setSelectedGuide(guide);
                setIsDeleteDialogOpen(true);
              }}
              onUploadPDF={() => {
                setSelectedGuide(guide);
                setIsUploadDialogOpen(true);
              }}
              onDownloadPDF={() => handleDownloadPDF(guide)}
              onMarkComplete={() => {
                setSelectedGuide(guide);
                setIsMarkCompleteDialogOpen(true);
              }}
              onViewHistory={() => {
                setSelectedGuide(guide);
                setIsHistoryDialogOpen(true);
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredGuides.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum guia encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterPeriod !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Crie seu primeiro guia de oração para começar.'}
            </p>
            {canManageGuides() && !searchTerm && filterPeriod === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Guia
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddPrayerGuideDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddGuide}
      />

      <EditPrayerGuideDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        guide={selectedGuide}
        onSubmit={handleEditGuide}
      />

      <DeletePrayerGuideDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        guide={selectedGuide}
        onConfirm={handleDeleteGuide}
      />

      <UploadPDFDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        guide={selectedGuide}
        onUpload={handleUploadPDF}
      />

      <PrayerHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        guide={selectedGuide}
        history={selectedGuide ? getGuideHistory(selectedGuide.id) : []}
        progress={selectedGuide ? getGuideProgress(selectedGuide.id) : []}
      />

      <MarkCompleteDialog
        open={isMarkCompleteDialogOpen}
        onOpenChange={setIsMarkCompleteDialogOpen}
        guide={selectedGuide}
        onConfirm={handleMarkComplete}
      />
    </MainLayout>
  );
}
