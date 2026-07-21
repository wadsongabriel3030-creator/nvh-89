import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  etapaFilter: string;
  onEtapaChange: (value: string) => void;
  sexoFilter: string;
  onSexoChange: (value: string) => void;
  onAddMember: () => void;
}

export function MemberFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  etapaFilter,
  onEtapaChange,
  sexoFilter,
  onSexoChange,
  onAddMember,
}: MemberFiltersProps) {

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
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

        <div className="flex gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Miembros</SelectItem>
              <SelectItem value="visitor">Invitados</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={etapaFilter} onValueChange={onEtapaChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              <SelectItem value="Adulto">Adulto</SelectItem>
              <SelectItem value="Joven Adulto">Joven Adulto</SelectItem>
              <SelectItem value="Joven">Joven</SelectItem>
              <SelectItem value="Niño">Niño</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sexoFilter} onValueChange={onSexoChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Hombre">Hombre</SelectItem>
              <SelectItem value="Mujer">Mujer</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAddMember} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Miembro</span>
          </Button>
        </div>
      </div>
    </div>
  );
}