import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface BaptismRow {
  id: string;
  full_name: string;
  member_id: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  record: BaptismRow;
  onEdit: (r: BaptismRow) => void;
  onDelete: (r: BaptismRow) => void;
  index: number;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-500/10 text-amber-500 border-0',
  completed: 'bg-success/10 text-success border-0',
  cancelled: 'bg-destructive/10 text-destructive border-0',
};
const statusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] ?? '?').toUpperCase();
}

export function BatismoCard({ record, onEdit, onDelete, index }: Props) {
  return (
    <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-cyan-500/10 text-cyan-500 font-semibold">
                {getInitials(record.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{record.full_name}</CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(record)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(record)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge className={statusColors[record.status]}>{statusLabels[record.status]}</Badge>
          {record.scheduled_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Fecha: {format(new Date(record.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy')}</span>
            </div>
          )}
          {record.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{record.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
