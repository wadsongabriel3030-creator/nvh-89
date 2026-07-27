import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMembers } from '@/contexts/MembersContext';
import { UserPlus } from 'lucide-react';

type Entry = {
  id: string;
  name: string;
  subtitle?: string;
  photoUrl?: string;
  role?: string;
  status?: string;
};

export function RecentMembers() {
  const { members } = useMembers();

  const recentMembers: Entry[] = members.slice(0, 5).map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    subtitle: m.phone,
    photoUrl: m.photoUrl,
    role: m.role,
    status: m.status,
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Inactivo</Badge>;
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

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Registros Recientes</h3>
          <p className="text-sm text-muted-foreground">Miembros de la iglesia</p>
        </div>
        <a href="/members" className="text-sm font-medium text-primary hover:underline">Ver todos</a>
      </div>
      {recentMembers.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Sin miembros registrados
        </div>
      ) : (
        <div className="space-y-3">
          {recentMembers.map((item, index) => (
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
                {item.role && getRoleBadge(item.role)}
                {item.status && getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}