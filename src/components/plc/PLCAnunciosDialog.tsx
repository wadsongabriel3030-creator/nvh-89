import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Megaphone, Upload, Download, Trash2, FileText, Image as ImageIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PLCAnuncio {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 data URL
  observacion: string;
  createdAt: string;
}

const STORAGE_KEY = 'plc-anuncios';
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function readAnuncios(): PLCAnuncio[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PLCAnunciosDialog({ open, onOpenChange }: Props) {
  const [anuncios, setAnuncios] = useState<PLCAnuncio[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [observacion, setObservacion] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) setAnuncios(readAnuncios());
  }, [open]);

  const persist = (list: PLCAnuncio[]) => {
    setAnuncios(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      toast.error('No se pudo guardar (almacenamiento lleno)');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error('Solo se permiten archivos PDF, PNG o JPG');
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error('El archivo supera el límite de 5MB');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Seleccione un archivo');
      return;
    }
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const nuevo: PLCAnuncio = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: dataUrl,
        observacion: observacion.trim(),
        createdAt: new Date().toISOString(),
      };
      persist([nuevo, ...anuncios]);
      setFile(null);
      setObservacion('');
      (document.getElementById('plc-anuncio-file') as HTMLInputElement | null)?.value &&
        ((document.getElementById('plc-anuncio-file') as HTMLInputElement).value = '');
      toast.success('¡Anuncio publicado!');
    } catch {
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (a: PLCAnuncio) => {
    const link = document.createElement('a');
    link.href = a.fileData;
    link.download = a.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    persist(anuncios.filter((a) => a.id !== id));
    toast.success('Anuncio eliminado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Anuncios PLC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Upload form */}
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium text-foreground">Nuevo anuncio</p>
            <div className="space-y-2">
              <Label htmlFor="plc-anuncio-file">Archivo (PDF, PNG, JPG) *</Label>
              <Input
                id="plc-anuncio-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="w-full text-xs sm:text-sm file:mr-2 file:text-xs sm:file:text-sm"
              />

              {file && (
                <p className="text-xs text-muted-foreground">
                  {file.name} — {formatSize(file.size)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plc-anuncio-obs">Observación</Label>
              <Textarea
                id="plc-anuncio-obs"
                placeholder="Información que debe pasar en el PLC..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleUpload} disabled={uploading || !file}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Subiendo...' : 'Publicar'}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Anuncios publicados ({anuncios.length})
            </p>
            {anuncios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aún no hay anuncios publicados.
              </p>
            ) : (
              <div className="space-y-2">
                {anuncios.map((a) => {
                  const isImage = a.fileType.startsWith('image/');
                  return (
                    <div key={a.id} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        {isImage ? (
                          <img
                            src={a.fileData}
                            alt={a.fileName}
                            className="w-14 h-14 object-cover rounded border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded border border-border bg-muted flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                            {isImage ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            {a.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatSize(a.fileSize)}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(a.createdAt).toLocaleString('es')}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(a)}
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(a.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {a.observacion && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap border-t border-border pt-2">
                          {a.observacion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}