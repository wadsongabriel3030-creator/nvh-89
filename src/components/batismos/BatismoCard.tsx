import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { BatismoRecord, Member } from '@/types';
import { format } from 'date-fns';

interface Props { record: BatismoRecord; member: Member | undefined; onEdit: (r: BatismoRecord) => void; onDelete: (r: BatismoRecord) => void; index: number; }
const statusColors = { scheduled: 'bg-amber-500/10 text-amber-500 border-0', completed: 'bg-success/10 text-success border-0', cancelled: 'bg-destructive/10 text-destructive border-0' };
const statusLabels = { scheduled: 'Agendado', completed: 'Realizado', cancelled: 'Cancelado' };

export function BatismoCard({ record, member, onEdit, onDelete, index }: Props) {
  if (!member) return null;
  return (
    <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm"><AvatarImage src={member.photoUrl} /><AvatarFallback className="bg-cyan-500/10 text-cyan-500 font-semibold">{member.firstName[0]}{member.lastName[0]}</AvatarFallback></Avatar>
            <div><CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle><p className="text-sm text-muted-foreground">{member.phone}</p></div>
          </div>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit(record)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => onDelete(record)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remover</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge className={statusColors[record.status]}>{statusLabels[record.status]}</Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>Data: {format(new Date(record.scheduledDate), "dd/MM/yyyy")}</span></div>
          {record.location && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{record.location}</span></div>}
        </div>
      </CardContent>
    </Card>
  );
}
