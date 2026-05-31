import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { NuevosComienzosParticipant } from '@/types';
import { toast } from 'sonner';

interface EditParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (participant: NuevosComienzosParticipant) => void;
  participant: NuevosComienzosParticipant | null;
}

export function EditParticipantDialog({ open, onOpenChange, onEdit, participant }: EditParticipantDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'dropped'>('in_progress');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (participant) {
      setStartDate(participant.startDate);
      setCompletionDate(participant.completionDate || '');
      setStatus(participant.status);
      setNotes(participant.notes || '');
    }
  }, [participant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant || !startDate) {
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    const updated: NuevosComienzosParticipant = {
      ...participant,
      startDate,
      completionDate: completionDate || undefined,
      status,
      notes: notes || undefined,
    };

    onEdit(updated);
    toast.success('Participante atualizado com sucesso!');
    onOpenChange(false);
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Participante</DialogTitle>
          <DialogDescription>Atualize as informações do participante.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="dropped">Desistiu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="completionDate">Data de Conclusão</Label>
              <Input type="date" id="completionDate" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
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
