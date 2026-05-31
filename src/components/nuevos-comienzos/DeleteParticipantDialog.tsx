import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { NuevosComienzosParticipant, Member } from '@/types';
import { toast } from 'sonner';

interface DeleteParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  participant: NuevosComienzosParticipant | null;
  member: Member | undefined;
}

export function DeleteParticipantDialog({ open, onOpenChange, onDelete, participant, member }: DeleteParticipantDialogProps) {
  const handleDelete = () => {
    if (participant) {
      onDelete(participant.id);
      toast.success('Participante removido com sucesso!');
      onOpenChange(false);
    }
  };

  if (!participant) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Participante</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{member?.firstName} {member?.lastName}</strong> do Nuevos Comienzos? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
