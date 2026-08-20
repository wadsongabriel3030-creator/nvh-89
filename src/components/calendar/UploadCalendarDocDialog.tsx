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
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CalendarActivity } from '@/types';

export interface CalendarDocFile {
  id: string;
  name: string;
  data: string;
  activityId: string;
  activityDate: string;
  uploadedAt: string;
}

interface UploadCalendarDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: CalendarActivity[];
  onSave: (doc: CalendarDocFile) => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt';

export function UploadCalendarDocDialog({
  open,
  onOpenChange,
  activities,
  onSave,
}: UploadCalendarDocDialogProps) {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!ACCEPTED_TYPES.includes(selected.type) && selected.type !== '') {
        toast({
          title: 'Arquivo inválido',
          description: 'Formatos aceitos: PDF, Word, Excel, PowerPoint, imagens e texto.',
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
      const activity = activities.find((a) => a.id === selectedActivityId);
      if (!activity) return;

      const docFile: CalendarDocFile = {
        id: Date.now().toString(),
        name: file.name,
        data: reader.result as string,
        activityId: activity.id,
        activityDate: activity.date,
        uploadedAt: new Date().toISOString(),
      };

      onSave(docFile);

      toast({
        title: 'Documento salvo',
        description: `"${file.name}" associado a ${activity.title} (${format(
          new Date(activity.date),
          'dd/MM/yyyy',
          { locale: ptBR }
        )})`,
      });

      setFile(null);
      setSelectedActivityId('');
      setIsUploading(false);
      onOpenChange(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível ler o arquivo.',
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
            <Upload className="w-5 h-5 text-primary" />
            Subir Documento a Actividad
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity selector */}
          <div className="space-y-2">
            <Label>Fecha / Actividad</Label>
            <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma atividade" />
              </SelectTrigger>
              <SelectContent>
                {activities
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {format(new Date(activity.date), 'dd/MM/yyyy', { locale: ptBR })} —{' '}
                      {activity.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>Documento</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-4 h-4" />
              {file ? file.name : 'Selecionar arquivo...'}
            </Button>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, PowerPoint, imagens, texto
            </p>
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
            {isUploading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function downloadCalendarDoc(doc: CalendarDocFile) {
  const link = document.createElement('a');
  link.href = doc.data;
  link.download = doc.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
