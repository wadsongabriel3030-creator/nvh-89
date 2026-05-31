import { Cake, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const birthdays = [
  {
    id: '1',
    name: 'Maria Santos',
    date: '28 Ene',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    isToday: true,
  },
  {
    id: '2',
    name: 'Carlos Rodriguez',
    date: '30 Ene',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isToday: false,
  },
  {
    id: '3',
    name: 'Ana Costa',
    date: '02 Feb',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isToday: false,
  },
];

export function BirthdaysList() {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <Cake className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cumpleañeros</h3>
          <p className="text-sm text-muted-foreground">Esta semana</p>
        </div>
      </div>
      <div className="space-y-4">
        {birthdays.map((person) => (
          <div
            key={person.id}
            className="flex items-center gap-3"
          >
            <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
              <AvatarImage src={person.photo} alt={person.name} />
              <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">{person.name}</p>
              <p className="text-sm text-muted-foreground">{person.date}</p>
            </div>
            {person.isToday && (
              <span className="text-xs font-semibold bg-accent text-accent-foreground px-2 py-1 rounded-full animate-pulse">
                ¡Hoy! 🎉
              </span>
            )}
            <Button variant="ghost" size="icon-sm">
              <Gift className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}