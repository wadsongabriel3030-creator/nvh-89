import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TagsList } from '@/components/tags/TagsList';
import { Tags as TagsIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTagDialog } from '@/components/tags/AddTagDialog';
import { useTags } from '@/contexts/TagsContext';
import { usePermissions, getTagsPermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { Tag } from '@/types';

export default function Tags() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { addTag } = useTags();
  const permState = usePermissions();
  const tagPerms = getTagsPermissions(permState);

  const handleAddTag = (tag: Omit<Tag, 'id'>) => {
    addTag(tag);
    toast.success('¡Etiqueta creada exitosamente!');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <TagsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Etiquetas</h1>
              <p className="text-muted-foreground">
                Organice miembros con etiquetas personalizadas
              </p>
            </div>
          </div>
          {tagPerms.canCreate && (
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Nueva Etiqueta
            </Button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Consejo:</span> Use etiquetas para categorizar miembros por nivel de discipulado, 
            área de servicio, participación en PLCs y mucho más. Puede crear etiquetas personalizadas 
            para atender las necesidades específicas de su iglesia.
          </p>
        </div>

        {/* Tags List */}
        <TagsList
          canCreate={tagPerms.canCreate}
          canEdit={tagPerms.canEdit}
          canDelete={tagPerms.canDelete}
        />
      </div>

      <AddTagDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddTag}
      />
    </MainLayout>
  );
}