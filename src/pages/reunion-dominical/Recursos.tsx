import { MainLayout } from '@/components/layout/MainLayout';
import { Megaphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import {
  UploadFileDialog,
  ReunionFilesList,
  type ReunionFile,
} from '@/components/reunion-dominical/UploadFileDialog';
import { useDbStorage } from '@/hooks/useDbStorage';
import { usePermissions, getReunionDominicalPermissions } from '@/hooks/usePermissions';

export default function Recursos() {
  const [open, setOpen] = useState(false);
  const { value: files, setValue: setFiles, loading } = useDbStorage<ReunionFile[]>('reunion_dominical_recursos', [], 'reunion-dominical');
  const permState = usePermissions();
  const rdPerms = getReunionDominicalPermissions(permState);

  const handleSaveFile = (file: ReunionFile) => {
    setFiles((prev) => [file, ...prev]);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Anuncios</h1>
              <p className="text-muted-foreground">Sube y gestiona anuncios para la reunión dominical</p>
            </div>
          </div>
          {rdPerms.canCreate && (
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" />
              Subir Anuncio
            </Button>
          )}
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando anuncios...</p>
          </Card>
        ) : files.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Megaphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sin anuncios aún</h3>
                <p className="text-muted-foreground mt-1">Sube archivos PDF, PNG o JPG para la reunión.</p>
              </div>
            </div>
          </Card>
        ) : (
          <ReunionFilesList files={files} onDelete={handleDelete} canDelete={rdPerms.canDelete} />
        )}

        <UploadFileDialog
          open={open}
          onOpenChange={setOpen}
          onSaveFile={handleSaveFile}
          folder="recursos"
          title="Subir Anuncio"
        />
      </div>
    </MainLayout>
  );
}

