import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Event } from '@/types';
import { Repeat, Upload, Image as ImageIcon, Download, Trash2, X, FileText, FilePlus } from 'lucide-react';
import {
  type ReunionFile,
  formatFileSize,
  downloadReunionFile,
} from '@/components/reunion-dominical/UploadFileDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDbStorage } from '@/hooks/useDbStorage';

interface EventImageMap {
  [eventId: string]: ReunionFile | null;
}

export interface EventDocumentMap {
  [eventId: string]: ReunionFile[];
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSubmit: (event: Event) => void;
}

const ACCEPTED_IMAGE = ['image/png', 'image/jpeg', 'image/webp'];
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

export { EventImageMap };

const eventTypes = [
  { value: 'worship', label: 'Reunión' },
  { value: 'special', label: 'Especial' },
  { value: 'ceremony', label: 'Ceremonia' },
  { value: 'retreat', label: 'Retiro' },
  { value: 'conference', label: 'Conferencia' },
  { value: 'training', label: 'Capacitación' },
];

const daysOfWeek = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const frequencyOptions = [
  { value: 'weekly', label: 'Semanal (1x por semana)' },
  { value: 'biweekly', label: 'Quincenal (cada 2 semanas)' },
  { value: 'monthly', label: 'Mensual (1x por mes)' },
  { value: 'yearly', label: 'Anual (1x por año)' },
];

const ACCEPTED_DOCS = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  return FileText;
}

export function EditEventDialog({ open, onOpenChange, event, onSubmit }: EditEventDialogProps) {
  const { toast } = useToast();
  const { value: eventImages, setValue: setEventImages } = useDbStorage<EventImageMap>('event-images', {}, 'events');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Documents per event
  const docKey = event ? `event-documents-${event.id}` : 'event-documents-__none__';
  const { value: eventDocuments, setValue: setEventDocuments } = useDbStorage<ReunionFile[]>(docKey, [], 'events');
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const currentImage = event ? eventImages[event.id] || null : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'worship',
    isRecurring: false,
    recurrenceType: 'fixed' as 'fixed' | 'temporal',
    recurrenceDay: 'friday',
    recurrenceFrequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly' | 'yearly',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        type: event.type,
        isRecurring: event.isRecurring || false,
        recurrenceType: event.recurrenceType || 'fixed',
        recurrenceDay: event.recurrenceDay || 'friday',
        recurrenceFrequency: event.recurrenceFrequency || 'weekly',
      });
    }
  }, [event]);

  const handleSubmit = () => {
    if (!event || !formData.title || !formData.date || !formData.startTime) return;

    const updatedEvent: Event = {
      ...event,
      title: formData.title,
      description: formData.description || undefined,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || undefined,
      type: formData.type,
      isRecurring: formData.isRecurring,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : undefined,
      recurrenceDay: formData.isRecurring && formData.recurrenceType === 'fixed' ? formData.recurrenceDay : undefined,
      recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency : undefined,
    };

    onSubmit(updatedEvent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>
            Actualice la información del evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nombre del evento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del evento"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Tipo de Evento</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">Hora Inicio *</Label>
              <Input
                id="edit-startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">Hora Fin</Label>
              <Input
                id="edit-endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Lugar</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Lugar del evento"
            />
          </div>

          {/* Recurrence Section */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary" />
              <Label className="text-base font-semibold">Repetición del Evento</Label>
            </div>

            <RadioGroup
              value={formData.isRecurring ? 'yes' : 'no'}
              onValueChange={(val) => setFormData({ ...formData, isRecurring: val === 'yes' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="edit-no-repeat" />
                <Label htmlFor="edit-no-repeat" className="font-normal cursor-pointer">Único</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="edit-yes-repeat" />
                <Label htmlFor="edit-yes-repeat" className="font-normal cursor-pointer">Repetitivo</Label>
              </div>
            </RadioGroup>

            {formData.isRecurring && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label>Tipo de Repetición</Label>
                  <RadioGroup
                    value={formData.recurrenceType}
                    onValueChange={(val) => setFormData({ ...formData, recurrenceType: val as 'fixed' | 'temporal' })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="edit-fixed" />
                      <Label htmlFor="edit-fixed" className="font-normal cursor-pointer">Fijo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="temporal" id="edit-temporal" />
                      <Label htmlFor="edit-temporal" className="font-normal cursor-pointer">Temporal</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.recurrenceType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Día fijo</Label>
                    <Select
                      value={formData.recurrenceDay}
                      onValueChange={(value) => setFormData({ ...formData, recurrenceDay: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select
                    value={formData.recurrenceFrequency}
                    onValueChange={(value) => setFormData({ ...formData, recurrenceFrequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <Label className="text-base font-semibold">Imagen del Evento</Label>
            </div>

            {currentImage ? (
              <div className="rounded-lg overflow-hidden border border-border bg-card">
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={currentImage.data}
                    alt={currentImage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium text-sm text-foreground truncate" title={currentImage.name}>
                    {currentImage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(currentImage.size)}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => downloadReunionFile(currentImage)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive gap-1.5"
                      onClick={handleDeleteImage}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary/50 border-muted-foreground/25"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {isUploadingImage ? (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Subir imagen del evento</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG o WebP — clic para seleccionar</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold">Documentos del Evento</span>
              <span className="text-xs text-muted-foreground ml-auto">PDF, PNG, JPG, DOCX</span>
            </div>

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => docInputRef.current?.click()}
              onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDocDrop}
            >
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={handleDocSelect}
                className="hidden"
                multiple
              />
              {isUploadingDoc ? (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 mx-auto text-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Arrastra un archivo o haz clic para subir</p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG, DOCX</p>
                </div>
              )}
            </div>

            {/* Document list */}
            {eventDocuments.length > 0 && (
              <div className="space-y-2">
                {eventDocuments.map((doc) => {
                  const Icon = getFileIcon(doc.type);
                  return (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <Icon className="w-5 h-5 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => downloadReunionFile(doc)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.date || !formData.startTime}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !event) return;
    if (!ACCEPTED_IMAGE.includes(file.type)) {
      toast({ title: 'Formato no permitido', description: 'Sube PNG, JPG o WebP.', variant: 'destructive' });
      return;
    }
    setIsUploadingImage(true);
    try {
      await ensureBucket();
      const fileId = crypto.randomUUID();
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `event-images/${fileId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: true });

      let fileUrl: string;
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        fileUrl = urlData?.publicUrl || '';
      } else {
        fileUrl = await readFileAsDataUrl(file);
      }

      const imageFile: ReunionFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        data: fileUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setEventImages((prev) => ({ ...prev, [event.id]: imageFile }));
      toast({ title: 'Imagen subida', description: `"${file.name}" se asignó al evento.` });
    } catch (err) {
      console.error('[EditEventDialog] Image upload error:', err);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const imageFile: ReunionFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          data: dataUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setEventImages((prev) => ({ ...prev, [event.id]: imageFile }));
        toast({ title: 'Imagen guardada', description: `"${file.name}" se guardó (modo local).` });
      } catch {
        toast({ title: 'Error', description: 'No se pudo guardar la imagen.', variant: 'destructive' });
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDeleteImage() {
    if (!event) return;
    setEventImages((prev) => {
      const updated = { ...prev };
      delete updated[event.id];
      return updated;
    });
    toast({ title: 'Imagen eliminada', description: 'La imagen del evento fue removida.' });
  }

  // ─── Document handlers ───────────────────────────────────────────────────────

  async function uploadDocFile(file: File) {
    if (!event) return;
    if (!ACCEPTED_DOCS.includes(file.type)) {
      toast({ title: 'Formato no permitido', description: 'Sube PDF, PNG, JPG o DOCX.', variant: 'destructive' });
      return;
    }
    setIsUploadingDoc(true);
    try {
      await ensureBucket();
      const fileId = crypto.randomUUID();
      const ext = file.name.split('.').pop() || 'bin';
      const storagePath = `event-docs/${fileId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: true });

      let fileUrl: string;
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        fileUrl = urlData?.publicUrl || '';
      } else {
        fileUrl = await readFileAsDataUrl(file);
      }

      const docFile: ReunionFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        data: fileUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setEventDocuments((prev) => [...prev, docFile]);
      toast({ title: 'Documento subido', description: `"${file.name}" se añadió al evento.` });
    } catch (err) {
      console.error('[EditEventDialog] Doc upload error:', err);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const docFile: ReunionFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          data: dataUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setEventDocuments((prev) => [...prev, docFile]);
        toast({ title: 'Documento guardado', description: `"${file.name}" se guardó (modo local).` });
      } catch {
        toast({ title: 'Error', description: 'No se pudo guardar el documento.', variant: 'destructive' });
      }
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  }

  async function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const f of files) await uploadDocFile(f);
  }

  async function handleDocDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    for (const f of files) await uploadDocFile(f);
  }

  function handleDeleteDoc(docId: string) {
    setEventDocuments((prev) => prev.filter((d) => d.id !== docId));
    toast({ title: 'Documento eliminado', description: 'El documento fue removido del evento.' });
  }
}