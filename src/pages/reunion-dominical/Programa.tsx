import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  UploadFileDialog,
  ReunionFilesList,
  getReunionFiles,
  saveReunionFiles,
  type ReunionFile,
} from '@/components/reunion-dominical/UploadFileDialog';

const STORAGE_KEY = 'reunion_dominical_programa';

export default function Programa() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<ReunionFile[]>([]);

  const refresh = () => setFiles(getReunionFiles(STORAGE_KEY));

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    saveReunionFiles(STORAGE_KEY, updated);
    setFiles(updated);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Programa</h1>
              <p className="text-muted-foreground">Programa de la reunión dominical</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" />
            Subir Programa
          </Button>
        </div>

        {files.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sin programas aún</h3>
                <p className="text-muted-foreground mt-1">Sube archivos PDF, PNG o JPG para la próxima reunión dominical.</p>
              </div>
            </div>
          </Card>
        ) : (
          <ReunionFilesList files={files} onDelete={handleDelete} />
        )}

        <UploadFileDialog
          open={open}
          onOpenChange={setOpen}
          onUploaded={refresh}
          storageKey={STORAGE_KEY}
          title="Subir Programa"
        />
      </div>
    </MainLayout>
  );
}
