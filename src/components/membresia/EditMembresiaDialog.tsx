import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MembresiaRecord } from '@/types';
import { toast } from 'sonner';

interface EditMembresiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (record: MembresiaRecord) => void;
  record: MembresiaRecord | null;
}

export function EditMembresiaDialog({ open, onOpenChange, onEdit, record }: EditMembresiaDialogProps) {
  const [requestDate, setRequestDate] = useState('');
  const [approvalDate, setApprovalDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (record) { setRequestDate(record.requestDate); setApprovalDate(record.approvalDate || ''); setStatus(record.status); setNotes(record.notes || ''); }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !requestDate) { toast.error('Por favor, preencha os campos obrigatórios'); return; }

    const updated: MembresiaRecord = { ...record, requestDate, approvalDate: approvalDate || undefined, status, notes: notes || undefined };
    onEdit(updated);
    toast.success('Solicitação atualizada com sucesso!');
    onOpenChange(false);
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Solicitação</DialogTitle>
          <DialogDescription>Atualize as informações da solicitação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="requestDate">Data da Solicitação *</Label>
              <Input type="date" id="requestDate" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="approvalDate">Data de Aprovação</Label>
              <Input type="date" id="approvalDate" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações opcionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
