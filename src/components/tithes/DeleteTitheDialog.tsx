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
import { TitheRecord } from './AddTitheDialog';

interface DeleteTitheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tithe: TitheRecord | null;
  onConfirm: () => void;
}

export function DeleteTitheDialog({ open, onOpenChange, tithe, onConfirm }: DeleteTitheDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Registro de Dízimo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o registro de dízimo de{' '}
            <span className="font-semibold">{tithe?.memberName}</span> no valor de{' '}
            <span className="font-semibold">{tithe ? formatCurrency(tithe.amount) : ''}</span>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
