import { Calendar, Clock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const typeColors: Record<string, string> = {
  worship:    'bg-primary/10 border-primary/20 text-primary',
  special:    'bg-accent/10 border-accent/20 text-accent',
  ceremony:   'bg-blue-500/10 border-blue-500/20 text-blue-500',
  retreat:    'bg-green-500/10 border-green-500/20 text-green-500',
  conference: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  training:   'bg-orange-500/10 border-orange-500/20 text-orange-500',
};

export function UpcomingEvents() {
  // Local date string (avoids timezone shift)
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['dashboard_upcoming_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, start_time, location, type')
        .gte('event_date', localDate)
        .order('event_date', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Próximos Eventos</h3>
          <p className="text-sm text-muted-foreground">Agenda de la semana</p>
        </div>
        <a href="/events" className="text-sm font-medium text-primary hover:underline">
          Ver calendario
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-40 mb-2" />
              <div className="flex gap-4">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No hay eventos próximos programados
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: any, index: number) => {
            // Parse date without timezone shift
            const [y, m, d] = event.event_date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            const dateLabel = format(dateObj, "EEE, d MMM", { locale: es });
            const color = typeColors[event.type] ?? typeColors.worship;

            return (
              <div
                key={event.id}
                className={cn(
                  'p-4 rounded-lg border transition-all hover:shadow-sm animate-fade-in',
                  color,
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <h4 className="font-semibold mb-1.5 text-sm">{event.title}</h4>
                <div className="flex flex-wrap gap-3 text-xs opacity-80">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="capitalize">{dateLabel}</span>
                  </div>
                  {event.start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.start_time.slice(0, 5)}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}