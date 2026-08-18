import { Search, Filter, Plus, Tags, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags } from '@/contexts/TagsContext';
import { cn } from '@/lib/utils';

interface MemberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  etapaFilter: string;
  onEtapaChange: (value: string) => void;
  sexoFilter: string;
  onSexoChange: (value: string) => void;
  tagFilter: string[];
  onTagFilterChange: (value: string[]) => void;
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
  tagFilter,
  onTagFilterChange,
  onAddMember,
}: MemberFiltersProps) {
  const { tags } = useTags();

  const toggleTag = (tagId: string) => {
    if (tagFilter.includes(tagId)) {
      onTagFilterChange(tagFilter.filter((id) => id !== tagId));
    } else {
      onTagFilterChange([...tagFilter, tagId]);
    }
  };

  const clearTagFilter = () => onTagFilterChange([]);

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
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los rangos</SelectItem>
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

          {/* Tag Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'gap-2',
                  tagFilter.length > 0 && 'border-primary text-primary'
                )}
              >
                <Tags className="w-4 h-4" />
                Etiquetas
                {tagFilter.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 font-medium">
                    {tagFilter.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Filtrar por etiquetas</p>
                  {tagFilter.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={clearTagFilter}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No hay etiquetas creadas.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {tags.map((tag) => {
                      const isSelected = tagFilter.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full font-medium transition-all',
                            isSelected
                              ? `${tag.color} text-white ring-2 ring-offset-1 ring-primary/50`
                              : `${tag.color} text-white opacity-50 hover:opacity-80`
                          )}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={onAddMember} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Miembro</span>
          </Button>
        </div>
      </div>
    </div>
  );
}