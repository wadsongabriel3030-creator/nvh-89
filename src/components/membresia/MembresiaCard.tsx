import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { MembresiaRecord, Member } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MembresiaCardProps {
  record: MembresiaRecord;
  member: Member | undefined;
  onEdit: (record: MembresiaRecord) => void;
  onDelete: (record: MembresiaRecord) => void;
  index: number;
}

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-500 border-0',
  approved: 'bg-success/10 text-success border-0',
  rejected: 'bg-destructive/10 text-destructive border-0',
};

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export function MembresiaCard({ record, member, onEdit, onDelete, index }: MembresiaCardProps) {
  if (!member) return null;

  return (
    <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage src={member.photoUrl} alt={member.firstName} />
              <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold">{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{member.phone}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(record)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(record)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remover</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge className={statusColors[record.status]}>{statusLabels[record.status]}</Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Solicitação: {format(new Date(record.requestDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          {record.approvalDate && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Calendar className="w-4 h-4" />
              <span>Aprovação: {format(new Date(record.approvalDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          )}
          {record.notes && <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{record.notes}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
