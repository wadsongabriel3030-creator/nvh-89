import { Cake, Gift } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isToday, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface MemberBirthday {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  photo_url: string | null;
}

/** Returns a Date object with birthday set to THIS or NEXT year (whichever is upcoming) */
function getNextBirthday(birthDate: string): Date {
  const today = new Date();
  const [year, month, day] = birthDate.split('-').map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }
  return next;
}

export function BirthdaysList() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members_birthdays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, birth_date, photo_url')
        .not('birth_date', 'is', null)
        .eq('status', 'active');
      if (error) throw error;
      return data as MemberBirthday[];
    },
  });

  const today = new Date();
  const in30Days = addDays(today, 30);

  // Filter + sort by upcoming birthday within next 30 days
  const upcomingBirthdays = members
    .map(m => ({ ...m, nextBirthday: getNextBirthday(m.birth_date) }))
    .filter(m => m.nextBirthday <= in30Days)
    .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
    .slice(0, 8);

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <Cake className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cumpleañeros</h3>
          <p className="text-sm text-muted-foreground">Próximos 30 días</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : upcomingBirthdays.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Cake className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No hay cumpleaños en los próximos 30 días
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBirthdays.map((person) => {
            const birthdayIsToday = isToday(person.nextBirthday);
            const daysUntil = differenceInDays(person.nextBirthday, today);
            const fullName = `${person.first_name} ${person.last_name}`;
            const initials = `${person.first_name[0]}${person.last_name[0]}`;
            const formattedDate = format(person.nextBirthday, 'dd MMM', { locale: es });

            return (
              <div key={person.id} className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                  <AvatarFallback className="text-xs font-semibold bg-accent/20 text-accent">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{fullName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
                </div>
                {birthdayIsToday ? (
                  <span className="text-xs font-semibold bg-accent text-accent-foreground px-2 py-1 rounded-full animate-pulse">
                    ¡Hoy! 🎉
                  </span>
                ) : daysUntil <= 7 ? (
                  <span className="text-xs font-medium bg-pink-500/15 text-pink-400 border border-pink-500/30 px-2 py-1 rounded-full">
                    {daysUntil}d
                  </span>
                ) : (
                  <Gift className="w-4 h-4 text-muted-foreground/40" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}