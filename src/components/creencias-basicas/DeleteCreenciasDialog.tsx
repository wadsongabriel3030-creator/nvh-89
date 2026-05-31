import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CreenciasBasicasParticipant, Member } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onDelete: (id: string) => void; participant: CreenciasBasicasParticipant | null; member: Member | undefined; }

export function DeleteCreenciasDialog({ open, onOpenChange, onDelete, participant, member }: Props) {
  if (!participant) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Remover Participante</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover <strong>{member?.firstName} {member?.lastName}</strong>?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { onDelete(participant.id); toast.success('Removido!'); onOpenChange(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
