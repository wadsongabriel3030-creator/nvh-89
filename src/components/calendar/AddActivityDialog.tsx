import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Activity {
  id: string;
  title: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'yellow' | 'pink';
  date: Date;
  time?: string;
  observaciones?: string;
  comments?: string;
  cycles?: string;
}

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (activity: Activity) => void;
  /** If provided, dialog opens in edit mode with fields pre-filled */
  editActivity?: Activity | null;
}

const colorOptions = [
  { value: 'purple', label: 'Morado (Servicio)', className: 'bg-purple-500' },
  { value: 'blue', label: 'Azul (Reunión)', className: 'bg-blue-500' },
  { value: 'green', label: 'Verde (PLC/VNH)', className: 'bg-emerald-500' },
  { value: 'orange', label: 'Naranja (Oración)', className: 'bg-orange-500' },
  { value: 'yellow', label: 'Amarillo (Noches)', className: 'bg-amber-500' },
  { value: 'pink', label: 'Rosa (Especial)', className: 'bg-pink-500' },
];

const defaultForm = {
  title: '',
  color: 'purple' as Activity['color'],
  date: undefined as Date | undefined,
  time: '',
  observaciones: '',
  cycles: '',
};

export function AddActivityDialog({ open, onOpenChange, onSubmit, editActivity }: AddActivityDialogProps) {
  const [formData, setFormData] = useState(defaultForm);
  const isEditMode = !!editActivity;

  // When dialog opens with an activity to edit, pre-fill form
  useEffect(() => {
    if (open && editActivity) {
      setFormData({
        title: editActivity.title,
        color: editActivity.color,
        date: editActivity.date,
        time: editActivity.time || '',
        observaciones: editActivity.observaciones || editActivity.comments || '',
        cycles: editActivity.cycles || '',
      });
    } else if (!open) {
      setFormData(defaultForm);
    }
  }, [open, editActivity]);

  const handleSubmit = () => {
    if (!formData.title || !formData.date) return;

    const activity: Activity = {
      id: editActivity?.id || Date.now().toString(),
      title: formData.title,
      color: formData.color,
      date: formData.date,
      time: formData.time || undefined,
      observaciones: formData.observaciones || undefined,
      comments: formData.observaciones || undefined,
      cycles: formData.cycles || undefined,
    };

    onSubmit(activity);

    setFormData(defaultForm);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditMode
              ? 'Modifique los datos de la actividad seleccionada.'
              : 'Complete los datos para agregar una nueva actividad al calendario.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Nombre de la Actividad *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Culto Dominical"
              className="bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-[#141414] border-[#2a2a2a] hover:bg-[#1f1f1f]",
                    !formData.date && "text-gray-600"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "dd 'de' MMMM 'de' yyyy", { locale: es }) : <span>Seleccione la fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-gray-300">Horario</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="bg-[#141414] border-[#2a2a2a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Color de la Actividad</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => setFormData({ ...formData, color: value as Activity['color'] })}
            >
              <SelectTrigger className="bg-[#141414] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Seleccione el color" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value} className="text-white hover:bg-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.className}`} />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycles" className="text-gray-300">Ciclo / Etiqueta</Label>
            <Input
              id="cycles"
              value={formData.cycles}
              onChange={(e) => setFormData({ ...formData, cycles: e.target.value })}
              placeholder="Ej: Inicia Primer ciclo"
              className="bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-gray-300">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Escribe tus observaciones..."
              rows={3}
              className="bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a]">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.date} className="bg-purple-600 hover:bg-purple-700">
            {isEditMode ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
