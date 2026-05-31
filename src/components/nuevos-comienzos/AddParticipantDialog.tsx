import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { NuevosComienzosParticipant, Member } from '@/types';
import { toast } from 'sonner';

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (participant: NuevosComienzosParticipant) => void;
  members: Member[];
  existingParticipantIds: string[];
}

export function AddParticipantDialog({ open, onOpenChange, onAdd, members, existingParticipantIds }: AddParticipantDialogProps) {
  const [memberId, setMemberId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');

  const availableMembers = members.filter(m => !existingParticipantIds.includes(m.id));

  const resetForm = () => {
    setMemberId('');
    setStartDate('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !startDate) {
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    const newParticipant: NuevosComienzosParticipant = {
      id: Date.now().toString(),
      memberId,
      startDate,
      status: 'in_progress',
      notes: notes || undefined,
    };

    onAdd(newParticipant);
    toast.success('Participante adicionado com sucesso!');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Adicionar Participante</DialogTitle>
          <DialogDescription>Adicione um novo participante ao Nuevos Comienzos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">Membro *</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o membro" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
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
