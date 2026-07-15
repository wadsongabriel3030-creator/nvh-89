import { useState, useEffect } from 'react';
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
import { Repeat } from 'lucide-react';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSubmit: (event: Event) => void;
}

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

export function EditEventDialog({ open, onOpenChange, event, onSubmit }: EditEventDialogProps) {
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
}