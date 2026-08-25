import { Member } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Phone, Mail, Calendar, Edit2, Trash2, Eye, Cake, User, MapPin, MessageSquare, UserCheck, FileText, Clock, Tags } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MemberSeguimiento } from './MemberSeguimientoDialog';

interface MemberCardProps {
  member: Member;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  onView?: (member: Member) => void;
  onSeguimiento?: (member: Member) => void;
  onAssignTags?: (member: Member) => void;
  seguimientoCount?: number;
  lastSeguimiento?: MemberSeguimiento | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

const getEtapaColor = (etapa?: string) => {
  switch (etapa) {
    case 'Adulto':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'Joven Adulto':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'Joven':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'Niño':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatBirthday = (birthDate?: string) => {
  if (!birthDate) return null;
  try {
    const date = new Date(birthDate + 'T00:00:00');
    return date.toLocaleDateString('es-GT', { day: 'numeric', month: 'long' });
  } catch {
    return null;
  }
};

export function MemberCard({ member, onEdit, onDelete, onView, onSeguimiento, onAssignTags, seguimientoCount = 0, lastSeguimiento, canEdit = true, canDelete = true }: MemberCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'visitor':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Miembro';
      case 'inactive':
        return 'Inactivo';
      case 'visitor':
        return 'Invitado';
      default:
        return status;
    }
  };

  const birthday = formatBirthday(member.birthDate);

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-soft transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 border-2 border-background shadow-md ring-2 ring-primary/10">
          <AvatarImage src={member.photoUrl} alt={member.firstName} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {member.firstName[0]}{member.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge className={cn('border-0', getStatusColor(member.status))}>
                  {getStatusLabel(member.status)}
                </Badge>
                {member.etapa && (
                  <Badge className={cn('border-0', getEtapaColor(member.etapa))}>
                    {member.etapa}
                  </Badge>
                )}
                {member.sexo && (
                  <Badge variant="outline" className="text-xs">
                    {member.sexo}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(member)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver perfil
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(member)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onSeguimiento?.(member)}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Seguimientos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssignTags?.(member)}>
                  <Tags className="w-4 h-4 mr-2" />
                  Etiquetas
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(member)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {birthday && (
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                <span>{birthday}</span>
              </div>
            )}
            {member.conversionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Convertido el {new Date(member.conversionDate).toLocaleDateString('es')}</span>
              </div>
            )}
            {member.zona && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{member.zona}</span>
              </div>
            )}
            {member.petitions && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5" />
                <span className="text-muted-foreground line-clamp-2">{member.petitions}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Registrado: {new Date(member.createdAt).toLocaleString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {lastSeguimiento && (
            <div className="mt-3 pt-2 border-t border-border space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                <UserCheck className="h-3 w-3 text-primary" />
                Último seguimiento
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium text-foreground">
                  {lastSeguimiento.responsable}:
                </span>{' '}
                {lastSeguimiento.nota}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => onSeguimiento?.(member)}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            Seguimientos ({seguimientoCount})
          </Button>

          {member.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className={cn('text-xs px-2 py-0.5 rounded-full text-white font-medium', tag.color)}
                >
                  {tag.name}
                </span>
              ))}
              {member.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  +{member.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}