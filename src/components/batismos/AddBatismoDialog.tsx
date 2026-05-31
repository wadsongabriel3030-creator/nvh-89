import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BatismoRecord, Member } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onAdd: (r: BatismoRecord) => void; members: Member[]; existingRecordIds: string[]; }

export function AddBatismoDialog({ open, onOpenChange, onAdd, members, existingRecordIds }: Props) {
  const [memberId, setMemberId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const availableMembers = members.filter(m => !existingRecordIds.includes(m.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !scheduledDate) { toast.error('Preencha os campos obrigatórios'); return; }
    onAdd({ id: Date.now().toString(), memberId, scheduledDate, status: 'scheduled', location: location || undefined });
    toast.success('Batismo agendado!');
    setMemberId(''); setScheduledDate(''); setLocation(''); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>Agendar Batismo</DialogTitle><DialogDescription>Agende um novo batismo.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Membro *</Label><Select value={memberId} onValueChange={setMemberId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{availableMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Data *</Label><Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Local</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Igreja Central" /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Agendar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
