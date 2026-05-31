import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tag } from '@/types';
import { TagBadge } from './TagBadge';

interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
  onConfirm: (id: string) => void;
}

export function DeleteTagDialog({ open, onOpenChange, tag, onConfirm }: DeleteTagDialogProps) {
  const handleConfirm = () => {
    if (tag) {
      onConfirm(tag.id);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Etiqueta</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              ¿Está seguro que desea eliminar esta etiqueta? Esta acción no se puede deshacer.
            </p>
            {tag && (
              <div className="flex items-center gap-2">
                <span>Etiqueta:</span>
                <TagBadge tag={tag} />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}