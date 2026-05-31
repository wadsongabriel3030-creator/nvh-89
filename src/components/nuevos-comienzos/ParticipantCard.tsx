import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { NuevosComienzosParticipant, Member } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParticipantCardProps {
  participant: NuevosComienzosParticipant;
  member: Member | undefined;
  onEdit: (participant: NuevosComienzosParticipant) => void;
  onDelete: (participant: NuevosComienzosParticipant) => void;
  index: number;
}

const statusColors = {
  in_progress: 'bg-primary/10 text-primary border-0',
  completed: 'bg-success/10 text-success border-0',
  dropped: 'bg-destructive/10 text-destructive border-0',
};

const statusLabels = {
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  dropped: 'Desistiu',
};

export function ParticipantCard({ participant, member, onEdit, onDelete, index }: ParticipantCardProps) {
  if (!member) return null;

  return (
    <Card
      className="hover:shadow-soft transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage src={member.photoUrl} alt={member.firstName} />
              <AvatarFallback className="bg-amber-500/10 text-amber-500 font-semibold">
                {member.firstName[0]}{member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{member.phone}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(participant)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(participant)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[participant.status]}>
              {statusLabels[participant.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Início: {format(new Date(participant.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          {participant.completionDate && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Calendar className="w-4 h-4" />
              <span>Conclusão: {format(new Date(participant.completionDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          )}
          {participant.notes && (
            <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{participant.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
