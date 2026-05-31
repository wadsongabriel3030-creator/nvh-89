import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Users, Calendar, User } from 'lucide-react';
import { PLCGroup, Member } from '@/types';

interface PLCDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: PLCGroup | null;
  leader: Member | undefined;
  members: Member[];
}

export function PLCDetailsDialog({ open, onOpenChange, group, leader, members }: PLCDetailsDialogProps) {
  if (!group) return null;

  // Filtra os membros que pertencem a este PLC
  const plcMembers = members.filter((m) => group.members.includes(m.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {group.name}
            <Badge className={group.isActive ? 'bg-success/10 text-success border-0' : 'bg-muted text-muted-foreground border-0'}>
              {group.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Día de la Reunión</p>
                <p className="font-medium text-foreground">{group.meetingDay}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="font-medium text-foreground">{group.meetingTime}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 rounded-lg bg-success/10">
              <MapPin className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lugar</p>
              <p className="font-medium text-foreground">{group.location}</p>
            </div>
          </div>

          <Separator />

          {/* Líder */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Líder del PLC
            </h4>
            {leader ? (
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Avatar className="w-14 h-14 border-2 border-background shadow-md">
                  <AvatarImage src={leader.photoUrl} alt={leader.firstName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {leader.firstName[0]}{leader.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-lg">
                    {leader.firstName} {leader.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{leader.phone}</p>
                  {leader.email && (
                    <p className="text-sm text-muted-foreground">{leader.email}</p>
                  )}
                </div>
                <Badge className="bg-primary/10 text-primary border-0">Líder</Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Líder no encontrado</p>
            )}
          </div>

          <Separator />

          {/* Membros */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Miembros ({plcMembers.length})
            </h4>
            {plcMembers.length === 0 ? (
              <div className="text-center py-6 bg-muted/30 rounded-lg">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Aún no se ha añadido ningún miembro
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {plcMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                      <AvatarImage src={member.photoUrl} alt={member.firstName} />
                      <AvatarFallback className="bg-secondary/50 text-secondary-foreground font-semibold">
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{member.phone}</p>
                    </div>
                    <Badge 
                      className={
                        member.status === 'active' 
                          ? 'bg-success/10 text-success border-0' 
                          : 'bg-muted text-muted-foreground border-0'
                      }
                    >
                      {member.status === 'active' ? 'Activo' : member.status === 'visitor' ? 'Visitante' : 'Inactivo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
