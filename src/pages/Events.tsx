import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar, Plus, MapPin, Clock, Users, Search, ClipboardList, Repeat, ExternalLink, Phone, MessageSquare, Trash2, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Event } from '@/types';
import { AddEventDialog } from '@/components/events/AddEventDialog';
import { EditEventDialog } from '@/components/events/EditEventDialog';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
import { EventDetailsDialog } from '@/components/events/EventDetailsDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const typeColors: Record<string, string> = {
  worship: 'bg-primary/10 text-primary',
  special: 'bg-accent/10 text-accent',
  ceremony: 'bg-blue-500/10 text-blue-600',
  retreat: 'bg-green-500/10 text-green-600',
  conference: 'bg-purple-500/10 text-purple-600',
  training: 'bg-orange-500/10 text-orange-600',
};

const typeLabels: Record<string, string> = {
  worship: 'Culto',
  special: 'Especial',
  ceremony: 'Ceremonia',
  retreat: 'Retiro',
  conference: 'Conferencia',
  training: 'Capacitación',
};

const generateGoogleCalendarUrl = (event: Event) => {
  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const startDateTime = formatDateTime(event.date, event.startTime);
  const endDateTime = event.endTime
    ? formatDateTime(event.date, event.endTime)
    : formatDateTime(event.date, event.startTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
  });

  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

// Mapeia uma linha do banco para o tipo Event do app
type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  encargado: string | null;
  type: string | null;
  is_recurring: boolean;
  recurrence_type: string | null;
  recurrence_day: string | null;
  recurrence_frequency: string | null;
};

const rowToEvent = (row: EventRow, attendees: string[]): Event => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  date: row.event_date,
  startTime: row.start_time || '',
  endTime: row.end_time || '',
  location: row.location || undefined,
  encargado: row.encargado || undefined,
  type: row.type || 'worship',
  attendees,
  isRecurring: row.is_recurring,
  recurrenceType: (row.recurrence_type as 'fixed' | 'temporal') || undefined,
  recurrenceDay: row.recurrence_day || undefined,
  recurrenceFrequency: (row.recurrence_frequency as Event['recurrenceFrequency']) || undefined,
});

const eventToRow = (event: Event) => ({
  title: event.title,
  description: event.description ?? null,
  event_date: event.date,
  start_time: event.startTime || null,
  end_time: event.endTime || null,
  location: event.location ?? null,
  encargado: event.encargado ?? null,
  type: event.type,
  is_recurring: event.isRecurring,
  recurrence_type: event.recurrenceType ?? null,
  recurrence_day: event.recurrenceDay ?? null,
  recurrence_frequency: event.recurrenceFrequency ?? null,
});

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  interface InscripcionEvento {
    id: string;
    eventSlug: string;
    eventName: string;
    nombre: string;
    apellido: string;
    telefono: string;
    observaciones: string;
    fechaRegistro: string;
  }
  const [inscripciones, setInscripciones] = useState<InscripcionEvento[]>([]);

  const loadInscripciones = useCallback(async () => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, full_name, phone, extra, created_at, status, event_id, events(title)')
      .order('created_at', { ascending: false });
    if (error || !data) {
      setInscripciones([]);
      return;
    }
    const mapped: InscripcionEvento[] = data.map((r: any) => {
      const extra = (r.extra || {}) as Record<string, any>;
      const eventTitle = r.events?.title || '';
      return {
        id: r.id,
        eventSlug: eventTitle.toLowerCase().replace(/\s+/g, '-'),
        eventName: eventTitle,
        nombre: extra.nombre || r.full_name?.split(' ')[0] || '',
        apellido: extra.apellido || r.full_name?.split(' ').slice(1).join(' ') || '',
        telefono: r.phone || '',
        observaciones: extra.observaciones || '',
        fechaRegistro: r.created_at,
      };
    });
    setInscripciones(mapped);
  }, []);

  const handleDeleteInscripcion = async (id: string) => {
    const { error } = await supabase.from('event_registrations').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar inscripción');
      return;
    }
    setInscripciones((prev) => prev.filter((i) => i.id !== id));
    toast.success('Inscripción eliminada');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const [{ data: rows, error }, { data: attendeeRows }] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('event_attendees').select('event_id, member_id'),
    ]);
    if (error) {
      toast.error('Error al cargar eventos');
      setLoading(false);
      return;
    }
    const attendeesByEvent: Record<string, string[]> = {};
    (attendeeRows || []).forEach((a) => {
      (attendeesByEvent[a.event_id] ||= []).push(a.member_id);
    });
    setEvents((rows || []).map((r) => rowToEvent(r as EventRow, attendeesByEvent[r.id] || [])));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
    loadInscripciones();
  }, [loadEvents, loadInscripciones]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddEvent = async (event: Event) => {
    const { error } = await supabase.from('events').insert(eventToRow(event));
    if (error) {
      toast.error('No se pudo crear el evento');
      return;
    }
    toast.success('¡Evento creado exitosamente!');
    loadEvents();
  };

  const handleEditEvent = async (updatedEvent: Event) => {
    const { error } = await supabase.from('events').update(eventToRow(updatedEvent)).eq('id', updatedEvent.id);
    if (error) {
      toast.error('No se pudo actualizar el evento');
      return;
    }
    toast.success('¡Evento actualizado exitosamente!');
    loadEvents();
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const { error } = await supabase.from('events').delete().eq('id', selectedEvent.id);
    if (error) {
      toast.error('No se pudo eliminar el evento');
      return;
    }
    setDeleteDialogOpen(false);
    setDetailsDialogOpen(false);
    setSelectedEvent(null);
    toast.success('¡Evento eliminado exitosamente!');
    loadEvents();
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const handleManageEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleEditFromDetails = () => {
    setDetailsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleDeleteFromDetails = () => {
    setDetailsDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
              <p className="text-muted-foreground">
                Administre el calendario de actividades de la iglesia
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="worship">Culto</SelectItem>
              <SelectItem value="special">Especial</SelectItem>
              <SelectItem value="ceremony">Ceremonia</SelectItem>
              <SelectItem value="retreat">Retiro</SelectItem>
              <SelectItem value="conference">Conferencia</SelectItem>
              <SelectItem value="training">Capacitación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Cargando eventos...</p>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Ningún evento encontrado.</p>
            </Card>
          ) : (
            filteredEvents.map((event, index) => (
              <Card
                key={event.id}
                className="hover:shadow-soft transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date */}
                    <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {new Date(event.date + 'T00:00:00').getDate()}
                      </span>
                      <span className="text-xs text-primary uppercase">
                        {new Date(event.date + 'T00:00:00').toLocaleDateString('es', { month: 'short' })}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees.length} inscritos</span>
                            </div>
                            {event.isRecurring && (
                              <div className="flex items-center gap-1.5 text-primary">
                                <Repeat className="w-4 h-4" />
                                <span>
                                  {event.recurrenceType === 'fixed' ? 'Fijo' : 'Temporal'}
                                  {' · '}
                                  {{ weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' }[event.recurrenceFrequency || ''] || ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={cn('border-0 shrink-0', typeColors[event.type] || typeColors.worship)}>
                          {typeLabels[event.type] || event.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(event)}>
                        Detalles
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/inscripcion-evento/${encodeURIComponent(event.title.toLowerCase().replace(/\s+/g, '-'))}`)}>
                        <ClipboardList className="w-3.5 h-3.5" />
                        Inscríbete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(generateGoogleCalendarUrl(event), '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lembrete Google Calendar
                      </Button>
                      <Button size="sm" onClick={() => handleManageEvent(event)}>
                        Administrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Inscripciones de Eventos */}
        {inscripciones.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <CalendarCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Inscripciones Recibidas</h2>
                <p className="text-sm text-muted-foreground">{inscripciones.length} inscripciones registradas</p>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Nombre Completo</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Evento</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Teléfono</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Observaciones</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Fecha de Registro</th>
                        <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscripciones.map((insc) => (
                        <tr key={insc.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-foreground">{insc.nombre} {insc.apellido}</p>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-primary/10 text-primary border-0 capitalize">{insc.eventName}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              {insc.telefono}
                            </div>
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <p className="text-sm text-muted-foreground truncate">{insc.observaciones || '—'}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-muted-foreground">
                              {(() => { try { return new Date(insc.fechaRegistro).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return insc.fechaRegistro; } })()}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteInscripcion(insc.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {inscripciones.map((insc, index) => (
                <Card key={insc.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{insc.nombre} {insc.apellido}</p>
                        <Badge className="bg-primary/10 text-primary border-0 capitalize mt-1">{insc.eventName}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteInscripcion(insc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{insc.telefono}</span>
                      </div>
                      {insc.observaciones && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{insc.observaciones}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {(() => { try { return new Date(insc.fechaRegistro).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return insc.fechaRegistro; } })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddEventDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddEvent}
      />

      <EditEventDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={selectedEvent}
        onSubmit={handleEditEvent}
      />

      <DeleteEventDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        event={selectedEvent}
        onConfirm={handleDeleteEvent}
      />

      <EventDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        event={selectedEvent}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />
    </MainLayout>
  );
}
