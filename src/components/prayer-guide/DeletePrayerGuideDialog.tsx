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
import { PrayerGuide } from '@/types';

interface DeletePrayerGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  onConfirm: () => void;
}

export function DeletePrayerGuideDialog({ 
  open, 
  onOpenChange, 
  guide, 
  onConfirm 
}: DeletePrayerGuideDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Guia de Oração</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o guia <strong>"{guide?.title}"</strong>?
            <br /><br />
            Esta ação não pode ser desfeita. Todo o histórico de orações e progresso 
            associado a este guia será permanentemente removido.
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
