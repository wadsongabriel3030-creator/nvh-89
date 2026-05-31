import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MembresiaRecord, Member } from '@/types';
import { toast } from 'sonner';

interface DeleteMembresiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  record: MembresiaRecord | null;
  member: Member | undefined;
}

export function DeleteMembresiaDialog({ open, onOpenChange, onDelete, record, member }: DeleteMembresiaDialogProps) {
  const handleDelete = () => { if (record) { onDelete(record.id); toast.success('Solicitação removida com sucesso!'); onOpenChange(false); } };
  if (!record) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Solicitação</AlertDialogTitle>
          <AlertDialogDescription>Tem certeza que deseja remover a solicitação de <strong>{member?.firstName} {member?.lastName}</strong>? Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
