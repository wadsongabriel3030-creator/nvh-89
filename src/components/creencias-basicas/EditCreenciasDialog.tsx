import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreenciasBasicasParticipant } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onEdit: (p: CreenciasBasicasParticipant) => void; participant: CreenciasBasicasParticipant | null; }

export function EditCreenciasDialog({ open, onOpenChange, onEdit, participant }: Props) {
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'dropped'>('in_progress');

  useEffect(() => { if (participant) { setStartDate(participant.startDate); setCompletionDate(participant.completionDate || ''); setStatus(participant.status); } }, [participant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;
    onEdit({ ...participant, startDate, completionDate: completionDate || undefined, status });
    toast.success('Atualizado!'); onOpenChange(false);
  };

  if (!participant) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>Editar Participante</DialogTitle><DialogDescription>Atualize as informações.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Data de Início *</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Status *</Label><Select value={status} onValueChange={v => setStatus(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluído</SelectItem><SelectItem value="dropped">Desistiu</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label>Data de Conclusão</Label><Input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
