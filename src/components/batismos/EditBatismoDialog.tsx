import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BatismoRecord } from '@/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onEdit: (r: BatismoRecord) => void; record: BatismoRecord | null; }

export function EditBatismoDialog({ open, onOpenChange, onEdit, record }: Props) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [location, setLocation] = useState('');

  useEffect(() => { if (record) { setScheduledDate(record.scheduledDate); setStatus(record.status); setLocation(record.location || ''); } }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    onEdit({ ...record, scheduledDate, status, location: location || undefined, completedDate: status === 'completed' ? scheduledDate : undefined });
    toast.success('Atualizado!'); onOpenChange(false);
  };

  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>Editar Batismo</DialogTitle><DialogDescription>Atualize as informações.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Data *</Label><Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Status *</Label><Select value={status} onValueChange={v => setStatus(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Agendado</SelectItem><SelectItem value="completed">Realizado</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label>Local</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
