import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarCheck, ChevronLeft, ChevronRight, Send, CheckCircle, Clock, MapPin, Users, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDbStorage } from '@/hooks/useDbStorage';
import type { EventImageMap } from '@/components/events/EditEventDialog';

interface InscripcionEventoFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  observaciones: string;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  type: string | null;
}

const typeLabels: Record<string, string> = {
  worship: 'Reunión',
  special: 'Especial',
  ceremony: 'Ceremonia',
  retreat: 'Retiro',
  conference: 'Conferencia',
  training: 'Capacitación',
};

const generateGoogleCalendarUrl = (event: EventData) => {
  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const startDateTime = formatDateTime(event.event_date, event.start_time || '00:00');
  const endDateTime = event.end_time
    ? formatDateTime(event.event_date, event.end_time)
    : startDateTime;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
  });

  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

const TOTAL_STEPS = 4;

export default function InscripcionEvento() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const eventName = eventSlug ? decodeURIComponent(eventSlug).replace(/-/g, ' ') : 'Evento';

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const { value: eventImages } = useDbStorage<EventImageMap>('event-images', {}, 'events');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !eventSlug) return;
    fetchedRef.current = true;

    (async () => {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, description, event_date, start_time, end_time, location, type');

      const matched = (eventsData || []).find(
        (e: any) => e.title.toLowerCase().replace(/\s+/g, '-') === eventSlug
      ) as EventData | undefined;

      if (!matched) return;
      setEventData(matched);

      const { count } = await supabase
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', matched.id);
      setAttendeeCount(count || 0);
    })();
  }, [eventSlug]);

  const eventImage = eventData ? eventImages[eventData.id] || null : null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('es', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<InscripcionEventoFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    observaciones: '',
  });

  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!eventData) return;
      const fullName = `${formData.nombre} ${formData.apellido}`.trim();
      const { error } = await supabase.from('event_registrations').insert({
        event_id: eventData.id,
        full_name: fullName,
        phone: formData.telefono || null,
        extra: { observaciones: formData.observaciones, nombre: formData.nombre, apellido: formData.apellido } as any,
        status: 'registered',
      });

      if (error) throw error;
      toast.success('¡Inscripción enviada con éxito!');
      setSubmitted(true);
    } catch {
      toast.error('Error al enviar inscripción');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({ nombre: '', apellido: '', telefono: '', observaciones: '' });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.nombre.trim().length > 0;
      case 2: return formData.apellido.trim().length > 0;
      case 3: return formData.telefono.trim().length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Inscripción Enviada!</h2>
              <Button onClick={handleReset} className="mt-4">Registrar Otra Persona</Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4 gap-6">
        <Card className="w-full max-w-lg overflow-hidden shadow-lg">
          {eventImage ? (
            <div className="aspect-video w-full overflow-hidden bg-muted relative">
              <img
                src={eventImage.data}
                alt={eventData?.title || eventName}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-opacity duration-500"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                style={{ opacity: 0 }}
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <CalendarCheck className="w-16 h-16 text-primary/30" />
            </div>
          )}
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground capitalize leading-tight">{eventData?.title || eventName}</h2>
                {eventData?.type && <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{typeLabels[eventData.type] || eventData.type}</span>}
              </div>
              {eventData?.event_date && (
                <div className="flex-shrink-0 text-center bg-muted rounded-lg px-3 py-2 min-w-[52px]">
                  <span className="block text-lg font-bold text-primary leading-none">{new Date(eventData.event_date + 'T00:00:00').getDate()}</span>
                  <span className="block text-[10px] uppercase text-muted-foreground leading-none mt-0.5">{new Date(eventData.event_date + 'T00:00:00').toLocaleDateString('es', { month: 'short' })}</span>
                </div>
              )}
            </div>
            {eventData?.description && <p className="text-sm text-muted-foreground leading-relaxed">{eventData.description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground pt-2 border-t border-border/50">
              {eventData?.event_date && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <span className="capitalize">{formatDate(eventData.event_date)}</span></div>}
              {eventData?.start_time && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <span>{eventData.start_time}{eventData.end_time ? ` – ${eventData.end_time}` : ''}</span></div>}
              {eventData?.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span>{eventData.location}</span></div>}
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> <span>{attendeeCount} inscritos</span></div>
            </div>
            {eventData && (
              <div className="pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(generateGoogleCalendarUrl(eventData), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Recordatorio Google Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Paso {step} de {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="min-h-[200px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Nombre *</Label>
                  <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Escribe tu nombre" />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Apellido *</Label>
                  <Input value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} placeholder="Escribe tu apellido" />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Teléfono *</Label>
                  <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="+XX XXXX-XXXX" />
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Observaciones</Label>
                  <Textarea value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} placeholder="Escribe tus observaciones..." rows={5} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={step === 1}><ChevronLeft className="w-4 h-4" /> Anterior</Button>
              {step < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>Siguiente <ChevronRight className="w-4 h-4" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}><Send className="w-4 h-4" /> {submitting ? 'Enviando...' : 'Enviar'}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
