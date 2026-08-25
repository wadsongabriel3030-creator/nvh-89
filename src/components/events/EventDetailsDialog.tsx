import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, FileText, Repeat } from 'lucide-react';
import { Event } from '@/types';
import { cn } from '@/lib/utils';

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const typeColors: Record<string, string> = {
  worship: 'bg-primary/10 text-primary',
  special: 'bg-accent/10 text-accent',
  ceremony: 'bg-blue-500/10 text-blue-600',
  retreat: 'bg-green-500/10 text-green-600',
  conference: 'bg-purple-500/10 text-purple-600',
  training: 'bg-orange-500/10 text-orange-600',
};

const typeLabels: Record<string, string> = {
  worship: 'Reunión',
  special: 'Especial',
  ceremony: 'Ceremonia',
  retreat: 'Retiro',
  conference: 'Conferencia',
  training: 'Capacitación',
};

export function EventDetailsDialog({ open, onOpenChange, event, onEdit, onDelete, canEdit = true, canDelete = true }: EventDetailsDialogProps) {
  if (!event) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (startTime: string, endTime: string) => {
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <Badge className={cn('border-0 mt-2', typeColors[event.type] || typeColors.worship)}>
                {typeLabels[event.type] || event.type}
              </Badge>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Detalles del evento {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fecha */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground capitalize">{formatDate(event.date)}</p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Horario</p>
              <p className="text-sm text-muted-foreground">{formatTime(event.startTime, event.endTime)}</p>
            </div>
          </div>

          {/* Lugar */}
          {event.location && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Lugar</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          )}

          {/* Participantes */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Participantes</p>
              <p className="text-sm text-muted-foreground">{event.attendees.length} inscritos</p>
            </div>
          </div>

          {/* Repetición */}
          {event.isRecurring && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Repeat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Repetición</p>
                <p className="text-sm text-muted-foreground">
                  {event.recurrenceType === 'fixed'
                    ? `Fijo — cada ${
                        { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' }[event.recurrenceDay || ''] || event.recurrenceDay
                      }`
                    : 'Temporal'}
                  {' · '}
                  {{ weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' }[event.recurrenceFrequency || ''] || event.recurrenceFrequency}
                </p>
              </div>
            </div>
          )}

          {/* Descripción */}
          {event.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Descripción</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canDelete && (
            <Button variant="destructive" onClick={onDelete} className="w-full sm:w-auto">
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cerrar
          </Button>
          {canEdit && (
            <Button onClick={onEdit} className="w-full sm:w-auto">
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}