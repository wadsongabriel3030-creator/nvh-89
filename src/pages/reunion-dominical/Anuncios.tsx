import { useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Upload, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useDbStorage } from '@/hooks/useDbStorage';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  /** Public URL from Supabase Storage, or base64 data URL as fallback */
  url: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const BUCKET = 'reunion-files';

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Anuncios() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value: files, setValue: setFiles, loading } = useDbStorage<UploadedFile[]>('anuncios-pdfs', [], 'reunion-dominical');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(inputFiles)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      const allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'pptx'];
      if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
        toast({
          title: 'Archivo inválido',
          description: `${file.name} no es un archivo permitido (PDF, PNG, JPG o PPTX).`,
          variant: 'destructive',
        });
        continue;
      }

      const fileId = crypto.randomUUID();
      const fileExt = ext || 'bin';
      let url = '';

      try {
        await ensureBucket();
        const storagePath = `anuncios/${fileId}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, { contentType: file.type, upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
          url = urlData?.publicUrl || '';
        }
      } catch {
        // Storage not available, fall through
      }

      // Fallback to base64
      if (!url) {
        url = await readFileAsDataUrl(file);
      }

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url,
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: 'Archivo subido',
        description: `${newFiles.length} archivo(s) agregado(s).`,
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Archivo eliminado' });
  };

  const handleDownload = (file: UploadedFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recursos</h1>
              <p className="text-muted-foreground">Gestiona los recursos para la reunión dominical</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Subir Archivo
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Recurso
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando recursos...</p>
          </Card>
        ) : (
          <>
            {files.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Archivos disponibles ({files.length})
                  </h2>
                </div>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(file.size)} ·{' '}
                            {new Date(file.uploadedAt).toLocaleDateString('es-GT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sin recursos aún</h3>
                  <p className="text-muted-foreground mt-1">Sube recursos (PDF, PNG, JPG o PPTX) para compartir durante la reunión.</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
