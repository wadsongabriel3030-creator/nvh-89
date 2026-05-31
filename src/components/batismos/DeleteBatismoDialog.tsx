import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BatismoRecord, Member } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onDelete: (id: string) => void; record: BatismoRecord | null; member: Member | undefined; }

export function DeleteBatismoDialog({ open, onOpenChange, onDelete, record, member }: Props) {
  if (!record) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Remover Batismo</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover o batismo de <strong>{member?.firstName} {member?.lastName}</strong>?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { onDelete(record.id); toast.success('Removido!'); onOpenChange(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
