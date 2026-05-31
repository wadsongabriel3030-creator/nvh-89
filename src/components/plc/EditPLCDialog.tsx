import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PLCGroup, Member } from '@/types';
import { toast } from 'sonner';

interface EditPLCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (group: PLCGroup) => void;
  group: PLCGroup | null;
  members: Member[];
}

const daysOfWeek = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function EditPLCDialog({ open, onOpenChange, onEdit, group, members }: EditPLCDialogProps) {
  const [name, setName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setLeaderId(group.leaderId);
      setMeetingDay(group.meetingDay);
      setMeetingTime(group.meetingTime);
      setLocation(group.location);
      setIsActive(group.isActive);
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group) return;

    if (!name.trim() || !leaderId || !meetingDay || !meetingTime || !location.trim()) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    const updatedGroup: PLCGroup = {
      ...group,
      name: name.trim(),
      leaderId,
      meetingDay,
      meetingTime,
      location: location.trim(),
      isActive,
    };

    onEdit(updatedGroup);
    toast.success('¡PLC actualizado con éxito!');
    onOpenChange(false);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar PLC</DialogTitle>
          <DialogDescription>
            Actualice la información del PLC.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del PLC *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: PLC Centro"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leader">Líder *</Label>
              <Select value={leaderId} onValueChange={setLeaderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el líder" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="meetingDay">Día de la Reunión *</Label>
                <Select value={meetingDay} onValueChange={setMeetingDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el día" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meetingTime">Horario *</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Lugar *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Casa de Juan"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">PLC Activo</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
