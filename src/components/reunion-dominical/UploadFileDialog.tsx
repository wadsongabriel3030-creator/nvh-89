import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ReunionFile {
  id: string;
  name: string;
  type: string;
  data: string;
  size: number;
  uploadedAt: string;
}

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'];

export function getReunionFiles(storageKey: string): ReunionFile[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveReunionFiles(storageKey: string, files: ReunionFile[]) {
  localStorage.setItem(storageKey, JSON.stringify(files));
}

export function downloadReunionFile(file: ReunionFile) {
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
  storageKey: string;
  title?: string;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  onUploaded,
  storageKey,
  title = 'Subir Archivo',
}: UploadFileDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const accept = (f: File | undefined | null) => !!f && ACCEPTED.includes(f.type);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (accept(dropped)) setFile(dropped);
    else if (dropped) toast({ title: 'Formato no permitido', description: 'Sube PDF, PNG o JPG.', variant: 'destructive' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (accept(selected)) setFile(selected!);
    else if (selected) toast({ title: 'Formato no permitido', description: 'Sube PDF, PNG o JPG.', variant: 'destructive' });
  };

  const handleSave = () => {
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const item: ReunionFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        data: reader.result as string,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      const existing = getReunionFiles(storageKey);
      saveReunionFiles(storageKey, [item, ...existing]);
      toast({ title: 'Archivo guardado', description: `"${file.name}" se ha guardado correctamente.` });
      setFile(null);
      setIsUploading(false);
      onUploaded();
      onOpenChange(false);
    };
    reader.onerror = () => {
      toast({ title: 'Error', description: 'No se pudo leer el archivo.', variant: 'destructive' });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = (v: boolean) => {
    if (!v) setFile(null);
    onOpenChange(v);
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${file ? 'border-primary bg-primary/5' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="space-y-2">
              {isImage ? (
                <ImageIcon className="w-12 h-12 mx-auto text-primary" />
              ) : (
                <FileText className="w-12 h-12 mx-auto text-primary" />
              )}
              <p className="font-medium text-foreground break-all">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" /> Remover
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="font-medium text-foreground">Arrastra un archivo aquí</p>
              <p className="text-sm text-muted-foreground">PDF, PNG o JPG — o haz clic para seleccionar</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!file || isUploading}>
            {isUploading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FilesListProps {
  files: ReunionFile[];
  onDelete: (id: string) => void;
}

export function ReunionFilesList({ files, onDelete }: FilesListProps) {
  if (files.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((f) => {
        const isImage = f.type.startsWith('image/');
        return (
          <div key={f.id} className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
            <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img src={f.data} alt={f.name} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-3 space-y-2 flex-1 flex flex-col">
              <p className="font-medium text-sm text-foreground truncate" title={f.name}>{f.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(f.size)}</p>
              <div className="flex gap-2 mt-auto pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadReunionFile(f)}>
                  Descargar
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(f.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
