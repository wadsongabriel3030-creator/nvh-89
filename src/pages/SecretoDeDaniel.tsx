import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Search, LayoutGrid, List } from 'lucide-react';
import { AddPrayerGuideDialog } from '@/components/prayer-guide/AddPrayerGuideDialog';
import { EditPrayerGuideDialog } from '@/components/prayer-guide/EditPrayerGuideDialog';
import { DeletePrayerGuideDialog } from '@/components/prayer-guide/DeletePrayerGuideDialog';
import { UploadPDFDialog } from '@/components/prayer-guide/UploadPDFDialog';
import { PrayerHistoryDialog } from '@/components/prayer-guide/PrayerHistoryDialog';
import { MarkCompleteDialog } from '@/components/prayer-guide/MarkCompleteDialog';
import { PrayerGuideCard } from '@/components/prayer-guide/PrayerGuideCard';
import { PrayerGuide, PrayerProgress, PrayerHistory, PrayerGuidePDF } from '@/types';
import { toast } from 'sonner';

import { useDbStorage } from '@/hooks/useDbStorage';

const SecretoDeDaniel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editGuide, setEditGuide] = useState<PrayerGuide | null>(null);
  const [deleteGuideData, setDeleteGuideData] = useState<PrayerGuide | null>(null);
  const [uploadPdfGuide, setUploadPdfGuide] = useState<PrayerGuide | null>(null);
  const [historyGuide, setHistoryGuide] = useState<PrayerGuide | null>(null);
  const [markCompleteGuide, setMarkCompleteGuide] = useState<PrayerGuide | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { value: guides, setValue: setGuides } = useDbStorage<PrayerGuide[]>('secreto_daniel_guides', []);
  const { value: progress, setValue: setProgress } = useDbStorage<PrayerProgress[]>('secreto_daniel_progress', []);
  const { value: history, setValue: setHistory } = useDbStorage<PrayerHistory[]>('secreto_daniel_history', []);

  const saveGuides = (g: PrayerGuide[]) => setGuides(g);
  const saveProgress = (p: PrayerProgress[]) => setProgress(p);
  const saveHistory = (h: PrayerHistory[]) => setHistory(h);

  const handleCreate = (data: Omit<PrayerGuide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newGuide: PrayerGuide = { ...data, id: Date.now().toString(), createdBy: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveGuides([...guides, newGuide]);
    const entry: PrayerHistory = { id: Date.now().toString(), guideId: newGuide.id, guideTitle: newGuide.title, memberId: 'user-1', memberName: 'Admin', action: 'created', date: new Date().toISOString() };
    saveHistory([entry, ...history]);
    toast.success('Guia criado com sucesso!');
  };

  const handleUpdate = (id: string, data: Partial<PrayerGuide>) => {
    saveGuides(guides.map(g => g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g));
    setEditGuide(null);
    toast.success('Guia atualizado!');
  };

  const handleDelete = (id: string) => {
    saveGuides(guides.filter(g => g.id !== id));
    saveProgress(progress.filter(p => p.guideId !== id));
    setDeleteGuideData(null);
    toast.success('Guia removido!');
  };

  const handleDownload = (guide: PrayerGuide) => {
    if (!guide.pdfFile) return;
    const link = document.createElement('a');
    link.href = guide.pdfFile.data;
    link.download = guide.pdfFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };

  const handleUploadPDF = async (file: File) => {
    if (!uploadPdfGuide) return;
    const reader = new FileReader();
    reader.onload = () => {
      const pdf: PrayerGuidePDF = { id: Date.now().toString(), name: file.name, data: reader.result as string, uploadedAt: new Date().toISOString() };
      saveGuides(guides.map(g => g.id === uploadPdfGuide.id ? { ...g, pdfFile: pdf, updatedAt: new Date().toISOString() } : g));
      setUploadPdfGuide(null);
      toast.success('PDF anexado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleMarkComplete = (notes?: string) => {
    if (!markCompleteGuide) return;
    const existing = progress.find(p => p.guideId === markCompleteGuide.id && p.memberId === 'user-1' && new Date(p.completedDate).toDateString() === new Date().toDateString());
    if (existing) { toast.info('Já marcado como concluído hoje!'); return; }
    const newProgress: PrayerProgress = { id: Date.now().toString(), guideId: markCompleteGuide.id, memberId: 'user-1', memberName: 'Admin', completedDate: new Date().toISOString(), notes };
    saveProgress([...progress, newProgress]);
    const entry: PrayerHistory = { id: Date.now().toString(), guideId: markCompleteGuide.id, guideTitle: markCompleteGuide.title, memberId: 'user-1', memberName: 'Admin', action: 'completed', date: new Date().toISOString(), notes };
    saveHistory([entry, ...history]);
    setMarkCompleteGuide(null);
    toast.success('Oração marcada como concluída!');
  };

  const hasCompletedToday = (guideId: string) => progress.some(p => p.guideId === guideId && p.memberId === 'user-1' && new Date(p.completedDate).toDateString() === new Date().toDateString());

  const filtered = guides.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Secreto de Daniel</h1>
            <p className="text-muted-foreground mt-1">Guías de oración basadas en el Secreto de Daniel</p>
          </div>
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Nueva Guía
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar guías..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Guías del Secreto de Daniel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Nenhuma guía cadastrada ainda. Clique em "Nueva Guía" para adicionar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map(guide => (
              <PrayerGuideCard
                key={guide.id}
                guide={guide}
                progress={progress.filter(p => p.guideId === guide.id)}
                hasCompletedToday={hasCompletedToday(guide.id)}
                canManage={true}
                onEdit={() => setEditGuide(guide)}
                onDelete={() => setDeleteGuideData(guide)}
                onUploadPDF={() => setUploadPdfGuide(guide)}
                onDownloadPDF={() => handleDownload(guide)}
                onMarkComplete={() => setMarkCompleteGuide(guide)}
                onViewHistory={() => setHistoryGuide(guide)}
              />
            ))}
          </div>
        )}
      </div>

      <AddPrayerGuideDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleCreate} />

      {editGuide && (
        <EditPrayerGuideDialog open={!!editGuide} onOpenChange={(open) => !open && setEditGuide(null)} guide={editGuide} onSubmit={(id, data) => handleUpdate(id, data)} />
      )}

      {deleteGuideData && (
        <DeletePrayerGuideDialog open={!!deleteGuideData} onOpenChange={(open) => !open && setDeleteGuideData(null)} guide={deleteGuideData} onConfirm={() => handleDelete(deleteGuideData.id)} />
      )}

      {uploadPdfGuide && (
        <UploadPDFDialog open={!!uploadPdfGuide} onOpenChange={(open) => !open && setUploadPdfGuide(null)} guide={uploadPdfGuide} onUpload={handleUploadPDF} />
      )}

      {historyGuide && (
        <PrayerHistoryDialog open={!!historyGuide} onOpenChange={(open) => !open && setHistoryGuide(null)} guide={historyGuide} history={history.filter(h => h.guideId === historyGuide.id)} progress={progress.filter(p => p.guideId === historyGuide.id)} />
      )}

      {markCompleteGuide && (
        <MarkCompleteDialog open={!!markCompleteGuide} onOpenChange={(open) => !open && setMarkCompleteGuide(null)} guide={markCompleteGuide} onConfirm={handleMarkComplete} />
      )}
    </MainLayout>
  );
};

export default SecretoDeDaniel;
