import { Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const upcomingEvents = [
  {
    id: '1',
    title: 'Culto Dominical',
    date: '2024-01-28',
    time: '10:00',
    location: 'Templo Principal',
    type: 'worship',
  },
  {
    id: '2',
    title: 'Tiempo de Oración',
    date: '2024-01-28',
    time: '06:00',
    location: 'Sala de Oración',
    type: 'prayer',
  },
  {
    id: '3',
    title: 'PLC - Grupo Centro',
    date: '2024-02-02',
    time: '19:30',
    location: 'Casa de Carlos',
    type: 'plc',
  },
  {
    id: '4',
    title: 'Clase Nuevos Comienzos',
    date: '2024-02-03',
    time: '09:00',
    location: 'Sala 3',
    type: 'class',
  },
];

const typeColors: Record<string, string> = {
  worship: 'bg-primary/10 border-primary/20 text-primary',
  prayer: 'bg-accent/10 border-accent/20 text-accent',
  plc: 'bg-success/10 border-success/20 text-success',
  class: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
};

export function UpcomingEvents() {
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
      <div className="space-y-3">
        {upcomingEvents.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              'p-4 rounded-lg border transition-all hover:shadow-sm animate-fade-in',
              typeColors[event.type]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h4 className="font-semibold mb-2">{event.title}</h4>
            <div className="flex flex-wrap gap-4 text-sm opacity-80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}