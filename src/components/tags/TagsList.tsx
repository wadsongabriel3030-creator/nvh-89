import { useState } from 'react';
import { TagBadge } from './TagBadge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Tag, TagCategory } from '@/types';
import { AddTagDialog } from './AddTagDialog';
import { EditTagDialog } from './EditTagDialog';
import { DeleteTagDialog } from './DeleteTagDialog';
import { useTags } from '@/contexts/TagsContext';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
  discipleship: 'Discipulado',
  nuevos_comienzos: 'Nuevos Comienzos',
  server: 'Servidores',
  plc: 'PLC',
  custom: 'Personalizadas',
};

interface TagsListProps {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function TagsList({ canCreate = true, canEdit = true, canDelete = true }: TagsListProps) {
  const { tags, addTag, updateTag, deleteTag, getTagsByCategory } = useTags();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogCategory, setAddDialogCategory] = useState<TagCategory | undefined>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const groupedTags = getTagsByCategory();

  const handleAddTag = (tag: Omit<Tag, 'id'>) => {
    addTag(tag);
    toast.success('¡Etiqueta creada exitosamente!');
  };

  const handleEditTag = (id: string, updates: Partial<Tag>) => {
    updateTag(id, updates);
    toast.success('¡Etiqueta actualizada exitosamente!');
  };

  const handleDeleteTag = (id: string) => {
    deleteTag(id);
    toast.success('¡Etiqueta eliminada exitosamente!');
  };

  const openAddDialogForCategory = (category: TagCategory) => {
    setAddDialogCategory(category);
    setAddDialogOpen(true);
  };

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const categoryOrder: TagCategory[] = [
    'discipleship',
    'nuevos_comienzos',
    'server',
    'plc',
    'custom',
  ];

  return (
    <>
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const categoryTags = groupedTags[category] || [];
          
          return (
            <div key={category} className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {categoryLabels[category] || category}
                </h3>
                {canCreate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => openAddDialogForCategory(category)}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </Button>
                )}
              </div>
              <div className="bg-card rounded-xl p-4 border border-border shadow-card">
                {categoryTags.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Ninguna etiqueta en esta categoría
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {categoryTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="group flex items-center gap-2 bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors"
                      >
                        <TagBadge tag={tag} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(tag)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(tag)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTagDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddTag}
        defaultCategory={addDialogCategory}
      />

      <EditTagDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tag={selectedTag}
        onSave={handleEditTag}
      />

      <DeleteTagDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tag={selectedTag}
        onConfirm={handleDeleteTag}
      />
    </>
  );
}