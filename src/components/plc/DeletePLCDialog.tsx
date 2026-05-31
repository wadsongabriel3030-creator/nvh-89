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
import { PLCGroup } from '@/types';
import { toast } from 'sonner';

interface DeletePLCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  group: PLCGroup | null;
}

export function DeletePLCDialog({ open, onOpenChange, onDelete, group }: DeletePLCDialogProps) {
  const handleDelete = () => {
    if (group) {
      onDelete(group.id);
      toast.success('¡PLC eliminado con éxito!');
      onOpenChange(false);
    }
  };

  if (!group) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar PLC</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro de que desea eliminar el PLC <strong>{group.name}</strong>? 
            Esta acción no se puede deshacer y se perderán todos los datos relacionados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
