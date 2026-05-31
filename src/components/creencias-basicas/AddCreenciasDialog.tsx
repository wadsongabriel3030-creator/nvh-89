import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreenciasBasicasParticipant, Member } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onAdd: (p: CreenciasBasicasParticipant) => void; members: Member[]; existingParticipantIds: string[]; }

export function AddCreenciasDialog({ open, onOpenChange, onAdd, members, existingParticipantIds }: Props) {
  const [memberId, setMemberId] = useState('');
  const [startDate, setStartDate] = useState('');
  const availableMembers = members.filter(m => !existingParticipantIds.includes(m.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !startDate) { toast.error('Preencha os campos obrigatórios'); return; }
    onAdd({ id: Date.now().toString(), memberId, startDate, status: 'in_progress' });
    toast.success('Participante adicionado!');
    setMemberId(''); setStartDate(''); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>Adicionar Participante</DialogTitle><DialogDescription>Adicione ao curso de Creencias Básicas.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Membro *</Label><Select value={memberId} onValueChange={setMemberId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{availableMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Data de Início *</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Adicionar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
