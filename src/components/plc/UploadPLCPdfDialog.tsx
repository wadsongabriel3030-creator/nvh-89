import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import { PLCActivity } from './PLCCalendarDialog';

export interface PLCPdfFile {
  id: string;
  name: string;
  data: string;
  activityId: string;
  activityDate: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'plc_pdf_files';

export function getPLCPdfFiles(): PLCPdfFile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePLCPdfFiles(files: PLCPdfFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

interface UploadPLCPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: PLCActivity[];
  onUploaded: () => void;
}

export function UploadPLCPdfDialog({ open, onOpenChange, activities, onUploaded }: UploadPLCPdfDialogProps) {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        toast({
          title: 'Archivo inválido',
          description: 'Solo se permiten archivos PDF.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selected);
    }
  };

  const handleSave = async () => {
    if (!file || !selectedActivityId) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const activity = activities.find(a => a.id === selectedActivityId);
      if (!activity) return;

      const pdfFile: PLCPdfFile = {
        id: Date.now().toString(),
        name: file.name,
        data: reader.result as string,
        activityId: activity.id,
        activityDate: activity.date,
        uploadedAt: new Date().toISOString(),
      };

      const existing = getPLCPdfFiles();
      savePLCPdfFiles([...existing, pdfFile]);

      toast({
        title: 'PDF guardado',
        description: `"${file.name}" asociado a ${activity.activity} (${format(new Date(activity.date), "dd/MM/yyyy")})`,
      });

      setFile(null);
      setSelectedActivityId('');
      setIsUploading(false);
      onUploaded();
      onOpenChange(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'No se pudo leer el archivo.',
        variant: 'destructive',
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setFile(null);
      setSelectedActivityId('');
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            Subir PDF a Actividad PLC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date/Activity selector */}
          <div className="space-y-2">
            <Label>Fecha / Actividad</Label>
            <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una fecha de actividad" />
              </SelectTrigger>
              <SelectContent>
                {activities.map(activity => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {format(new Date(activity.date), "dd/MM/yyyy")} — {activity.activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>Archivo PDF</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-4 h-4" />
              {file ? file.name : 'Seleccionar archivo PDF...'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!file || !selectedActivityId || isUploading}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isUploading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function downloadPLCPdf(pdf: PLCPdfFile) {
  const link = document.createElement('a');
  link.href = pdf.data;
  link.download = pdf.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
