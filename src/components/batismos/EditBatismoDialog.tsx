import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BaptismRow } from './BatismoCard';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (r: BaptismRow) => Promise<void>;
  record: BaptismRow | null;
}

export function EditBatismoDialog({ open, onOpenChange, onEdit, record }: Props) {
  const [fullName, setFullName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setFullName(record.full_name);
      setScheduledDate(record.scheduled_date || '');
      setStatus(record.status);
      setLocation(record.location || '');
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    try {
      await onEdit({
        ...record,
        full_name: fullName.trim(),
        scheduled_date: scheduledDate || null,
        status,
        location: location.trim() || null,
        completed_date: status === 'completed' ? (scheduledDate || null) : null,
      });
      toast.success('¡Actualizado!');
      onOpenChange(false);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Bautismo</DialogTitle>
          <DialogDescription>Actualice la información.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre Completo *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha *</Label>
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Status *</Label>
              <Select value={status} onValueChange={v => setStatus(v as 'scheduled' | 'completed' | 'cancelled')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="completed">Realizado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Lugar</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
