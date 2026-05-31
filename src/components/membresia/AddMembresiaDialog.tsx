import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MembresiaRecord, Member } from '@/types';
import { toast } from 'sonner';

interface AddMembresiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: MembresiaRecord) => void;
  members: Member[];
  existingRecordIds: string[];
}

export function AddMembresiaDialog({ open, onOpenChange, onAdd, members, existingRecordIds }: AddMembresiaDialogProps) {
  const [memberId, setMemberId] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [notes, setNotes] = useState('');

  const availableMembers = members.filter(m => !existingRecordIds.includes(m.id));

  const resetForm = () => { setMemberId(''); setRequestDate(''); setNotes(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !requestDate) { toast.error('Por favor, preencha os campos obrigatórios'); return; }

    const newRecord: MembresiaRecord = { id: Date.now().toString(), memberId, requestDate, status: 'pending', notes: notes || undefined };
    onAdd(newRecord);
    toast.success('Solicitação criada com sucesso!');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Membresia</DialogTitle>
          <DialogDescription>Adicione uma nova solicitação de membresia.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">Membro *</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger><SelectValue placeholder="Selecione o membro" /></SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (<SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requestDate">Data da Solicitação *</Label>
              <Input type="date" id="requestDate" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações opcionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
