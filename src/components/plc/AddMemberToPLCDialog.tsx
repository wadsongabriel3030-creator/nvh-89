import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PLCGroup, Member, Tag } from '@/types';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

interface AddMemberToPLCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: PLCGroup | null;
  allMembers: Member[];
  onAddMember: (groupId: string, memberId: string) => void;
}

export function AddMemberToPLCDialog({ 
  open, 
  onOpenChange, 
  group, 
  allMembers,
  onAddMember 
}: AddMemberToPLCDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Filtra membros que ainda não estão neste PLC
  const availableMembers = allMembers.filter(
    (member) => !group?.members.includes(member.id) && member.id !== group?.leaderId
  );

  const selectedMember = allMembers.find(m => m.id === selectedMemberId);

  const resetForm = () => {
    setSelectedMemberId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMemberId || !group) {
      toast.error('Por favor, seleccione un miembro');
      return;
    }

    onAddMember(group.id, selectedMemberId);
    toast.success('¡Miembro añadido al PLC con éxito! La etiqueta "Miembro PLC" se aplicó automáticamente.');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Añadir Miembro al PLC
          </DialogTitle>
          <DialogDescription>
            Añada un miembro al {group?.name}. El miembro recibirá automáticamente la etiqueta "Miembro PLC".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">Seleccione el Miembro *</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Todos los miembros ya están en este PLC
                    </div>
                  ) : (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.firstName} {member.lastName}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedMember && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={selectedMember.photoUrl} alt={selectedMember.firstName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Badge className="bg-primary/10 text-primary border-0">
                    + Miembro PLC
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    (se añadirá automáticamente)
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedMemberId || availableMembers.length === 0}>
              <UserPlus className="w-4 h-4 mr-2" />
              Añadir Miembro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
