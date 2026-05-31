import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, MapPin, MoreVertical, Pencil, Trash2, Users, UserPlus, Eye, FileText } from 'lucide-react';
import { PLCGroup, Member } from '@/types';

interface PLCCardProps {
  group: PLCGroup;
  leader: Member | undefined;
  onEdit: (group: PLCGroup) => void;
  onDelete: (group: PLCGroup) => void;
  onAddMember: (group: PLCGroup) => void;
  onViewDetails: (group: PLCGroup) => void;
  index: number;
}

export function PLCCard({ group, leader, onEdit, onDelete, onAddMember, onViewDetails, index }: PLCCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:shadow-soft transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-xl truncate">{group.name}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{group.meetingDay} a las {group.meetingTime}</span>
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Badge className={`text-[10px] sm:text-xs ${group.isActive ? 'bg-success/10 text-success border-0' : 'bg-muted text-muted-foreground border-0'}`}>
              {group.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(group)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(group)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {/* Leader */}
        {leader && (
          <div className="flex items-center gap-3 mb-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-background shadow-sm shrink-0">
              <AvatarImage src={leader.photoUrl} alt={leader.firstName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {leader.firstName[0]}{leader.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base truncate">
                {leader.firstName} {leader.lastName}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Líder</p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 min-w-0">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{group.location}</span>
        </div>

        {/* Members */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {group.members.length} miembros
            </span>
          </div>
          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddMember(group)}
              className="gap-1 flex-1 text-xs sm:text-sm min-w-0"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span className="truncate">Añadir Miembro</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/reporte-plc?plc=${group.id}`)}
              className="gap-1 flex-1 text-xs sm:text-sm min-w-0"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Reporte PLC</span>
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
