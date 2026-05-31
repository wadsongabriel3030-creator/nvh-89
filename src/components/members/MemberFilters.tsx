import { Search, Filter, Plus, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MemberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAddMember: () => void;
}

export function MemberFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAddMember,
}: MemberFiltersProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="visitor">Visitantes</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => navigate('/primera-vez')} variant="outline" className="gap-2">
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Invitados</span>
        </Button>

        <Button onClick={onAddMember} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Miembro</span>
        </Button>
      </div>
    </div>
  );
}