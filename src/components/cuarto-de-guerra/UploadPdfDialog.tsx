import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface CuartoDeGuerraPdf {
  id: string;
  name: string;
  data: string;
  size: number;
  uploadedAt: string;
}

const STORAGE_KEY = 'cuarto_de_guerra_pdfs';

export function getCuartoDeGuerraPdfs(): CuartoDeGuerraPdf[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCuartoDeGuerraPdfs(files: CuartoDeGuerraPdf[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

export function downloadCuartoDeGuerraPdf(pdf: CuartoDeGuerraPdf) {
  const link = document.createElement('a');
  link.href = pdf.data;
  link.download = pdf.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface UploadPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export function UploadPdfDialog({ open, onOpenChange, onUploaded }: UploadPdfDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    if (dropped?.type === 'application/pdf') setFile(dropped);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === 'application/pdf') setFile(selected);
  };

  const handleSave = () => {
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const pdf: CuartoDeGuerraPdf = {
        id: crypto.randomUUID(),
        name: file.name,
        data: reader.result as string,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      const existing = getCuartoDeGuerraPdfs();
      saveCuartoDeGuerraPdfs([pdf, ...existing]);
      toast({ title: 'PDF guardado', description: `"${file.name}" se ha guardado correctamente.` });
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Subir Documento PDF
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
          <input ref={inputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
          {file ? (
            <div className="space-y-2">
              <FileText className="w-12 h-12 mx-auto text-primary" />
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-destructive hover:text-destructive">
                <X className="w-4 h-4 mr-1" /> Remover
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="font-medium text-foreground">Arrastra un archivo PDF aquí</p>
              <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!file || isUploading}>
            {isUploading ? 'Guardando...' : 'Guardar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
