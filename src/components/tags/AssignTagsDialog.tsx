import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagBadge } from './TagBadge';
import { Tag, TagCategory } from '@/types';
import { useTags } from '@/contexts/TagsContext';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  assignedTags: Tag[];
  onAssign: (tag: Tag) => void;
  onRemove: (tagId: string) => void;
}

const categoryLabels: Record<string, string> = {
  discipleship: 'Discipulado',
  nuevos_comienzos: 'Nuevos Comienzos',
  server: 'Servidores',
  plc: 'PLC',
  custom: 'Personalizadas',
};

const categoryOrder: TagCategory[] = [
  'discipleship',
  'nuevos_comienzos',
  'server',
  'plc',
  'custom',
];

export function AssignTagsDialog({
  open,
  onOpenChange,
  entityName,
  assignedTags,
  onAssign,
  onRemove,
}: AssignTagsDialogProps) {
  const { tags } = useTags();
  const [search, setSearch] = useState('');

  const assignedIds = useMemo(
    () => new Set(assignedTags.map((t) => t.id)),
    [assignedTags]
  );

  const availableTags = useMemo(() => {
    return tags.filter(
      (t) =>
        !assignedIds.has(t.id) &&
        (search === '' || t.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tags, assignedIds, search]);

  const groupedAvailable = useMemo(() => {
    const groups: Partial<Record<TagCategory, Tag[]>> = {};
    for (const tag of availableTags) {
      if (!groups[tag.category]) groups[tag.category] = [];
      groups[tag.category]!.push(tag);
    }
    return groups;
  }, [availableTags]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Etiquetas de{' '}
            <span className="text-primary">{entityName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Assigned Tags */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Etiquetas asignadas ({assignedTags.length})
          </p>
          {assignedTags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No tiene etiquetas asignadas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => onRemove(tag.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar etiquetas disponibles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Available Tags */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
          {categoryOrder.map((category) => {
            const catTags = groupedAvailable[category];
            if (!catTags || catTags.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {categoryLabels[category] || category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {catTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => onAssign(tag)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full font-medium text-white text-sm px-3 py-1',
                        'transition-all hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer',
                        tag.color
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {availableTags.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search
                ? 'No se encontraron etiquetas con ese nombre.'
                : 'Todas las etiquetas ya están asignadas.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
