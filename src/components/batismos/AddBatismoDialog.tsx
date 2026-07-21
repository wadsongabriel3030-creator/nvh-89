import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface AddBatismoPayload {
  full_name: string;
  scheduled_date: string;
  location: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (payload: AddBatismoPayload) => Promise<void>;
}

export function AddBatismoDialog({ open, onOpenChange, onAdd }: Props) {
  const [fullName, setFullName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !scheduledDate) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      await onAdd({ full_name: fullName.trim(), scheduled_date: scheduledDate, location: location.trim() });
      toast.success('¡Bautismo agendado!');
      setFullName('');
      setScheduledDate('');
      setLocation('');
      onOpenChange(false);
    } catch {
      toast.error('Error al agendar el bautismo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Agendar Bautismo</DialogTitle>
          <DialogDescription>Agende un nuevo bautismo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre Completo *</Label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha *</Label>
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Lugar</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Iglesia Central" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Agendar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
