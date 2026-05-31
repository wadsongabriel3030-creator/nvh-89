import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMembers } from '@/contexts/MembersContext';
import { UserPlus } from 'lucide-react';

type Entry = {
  id: string;
  name: string;
  subtitle?: string;
  photoUrl?: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

function readGuests(): Entry[] {
  try {
    const raw = localStorage.getItem('guests');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((g: any) => ({
      id: String(g.id),
      name: g.name,
      subtitle: g.phone,
      status: g.status,
      createdAt: g.createdAt,
    }));
  } catch {
    return [];
  }
}

function readPrimeraVez(): Entry[] {
  try {
    const raw = localStorage.getItem('primera-vez-submissions');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((p: any) => ({
      id: String(p.id),
      name: p.nombre,
      subtitle: p.telefono,
      createdAt: p.submittedAt,
    }));
  } catch {
    return [];
  }
}

export function RecentMembers() {
  const { members } = useMembers();
  const [guests, setGuests] = useState<Entry[]>([]);
  const [primeraVez, setPrimeraVez] = useState<Entry[]>([]);

  useEffect(() => {
    const reload = () => {
      setGuests(readGuests());
      setPrimeraVez(readPrimeraVez());
    };
    reload();
    window.addEventListener('storage', reload);
    window.addEventListener('guests-updated', reload);
    window.addEventListener('primera-vez-updated', reload);
    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener('guests-updated', reload);
      window.removeEventListener('primera-vez-updated', reload);
    };
  }, []);

  const recentMembers: Entry[] = members.slice(0, 5).map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    subtitle: m.phone,
    photoUrl: m.photoUrl,
    role: m.role,
    status: m.status,
  }));
  const recentGuests = guests.slice(0, 5);
  const recentPrimera = primeraVez.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'visitor':
        return <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-0">Visitante</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pastor':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Pastor</Badge>;
      case 'leader':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-0">Líder</Badge>;
      case 'server':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">Servidor</Badge>;
      default:
        return null;
    }
  };

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
  };

  const renderList = (items: Entry[], emptyText: string, viewAllHref?: string, kind?: 'member' | 'guest' | 'primera') => (
    <>
      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                <AvatarImage src={item.photoUrl} alt={item.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials(item.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.name}</p>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {kind === 'member' && item.role && getRoleBadge(item.role)}
                {kind === 'member' && item.status && getStatusBadge(item.status)}
                {kind === 'guest' && item.status && (
                  <Badge variant="secondary" className="capitalize">{item.status}</Badge>
                )}
                {kind === 'primera' && (
                  <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-0">Primera vez</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Registros Recientes</h3>
          <p className="text-sm text-muted-foreground">Miembros, invitados y primera vez</p>
        </div>
      </div>
      <Tabs defaultValue="members">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="guests">Invitados</TabsTrigger>
          <TabsTrigger value="primera">Primera vez</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <div className="flex justify-end mb-2">
            <a href="/members" className="text-sm font-medium text-primary hover:underline">Ver todos</a>
          </div>
          {renderList(recentMembers, 'Sin miembros registrados', '/members', 'member')}
        </TabsContent>
        <TabsContent value="guests" className="mt-4">
          <div className="flex justify-end mb-2">
            <a href="/guests" className="text-sm font-medium text-primary hover:underline">Ver todos</a>
          </div>
          {renderList(recentGuests, 'Sin invitados registrados', '/guests', 'guest')}
        </TabsContent>
        <TabsContent value="primera" className="mt-4">
          <div className="flex justify-end mb-2">
            <a href="/primera-vez" className="text-sm font-medium text-primary hover:underline">Abrir formulario</a>
          </div>
          {renderList(recentPrimera, 'Sin registros de primera vez', '/primera-vez', 'primera')}
        </TabsContent>
      </Tabs>
    </div>
  );
}