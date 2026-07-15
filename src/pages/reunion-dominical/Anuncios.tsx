import { useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Megaphone, Plus, Upload, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useDbStorage } from '@/hooks/useDbStorage';

interface PdfFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  dataUrl: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Anuncios() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value: pdfs, setValue: setPdfs, loading } = useDbStorage<PdfFile[]>('anuncios-pdfs', [], 'reunion-dominical');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPdfs: PdfFile[] = [];
    for (const file of Array.from(files)) {
      if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
        toast({
          title: 'Archivo inválido',
          description: `${file.name} no es un archivo permitido (PDF, PNG o JPG).`,
          variant: 'destructive',
        });
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newPdfs.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl,
      });
    }

    if (newPdfs.length > 0) {
      setPdfs((prev) => [...prev, ...newPdfs]);
      toast({
        title: 'Archivo subido',
        description: `${newPdfs.length} archivo(s) agregado(s).`,
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Archivo eliminado' });
  };

  const handleDownload = (pdf: PdfFile) => {
    const a = document.createElement('a');
    a.href = pdf.dataUrl;
    a.download = pdf.name;
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
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Anuncios</h1>
              <p className="text-muted-foreground">Gestiona los anuncios para la reunión dominical</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg"
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
              Nuevo Anuncio
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando anuncios...</p>
          </Card>
        ) : (
          <>
            {pdfs.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Archivos disponibles ({pdfs.length})
                  </h2>
                </div>
                <ul className="space-y-2">
                  {pdfs.map((pdf) => (
                    <li
                      key={pdf.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{pdf.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(pdf.size)} ·{' '}
                            {new Date(pdf.uploadedAt).toLocaleDateString('es-GT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          onClick={() => handleDownload(pdf)}
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(pdf.id)}
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
                  <Megaphone className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sin anuncios aún</h3>
                  <p className="text-muted-foreground mt-1">Crea anuncios para compartir durante la reunión.</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
