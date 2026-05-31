import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TitheRecord } from './AddTitheDialog';

interface EditTitheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tithe: TitheRecord | null;
  onSubmit: (tithe: TitheRecord) => void;
}

export function EditTitheDialog({ open, onOpenChange, tithe, onSubmit }: EditTitheDialogProps) {
  const [formData, setFormData] = useState({
    date: '',
    memberName: '',
    titheAmount: '',
    tithePaymentMethod: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque',
    titheTransferNumber: '',
    offeringAmount: '',
    offeringPaymentMethod: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque',
    offeringTransferNumber: '',
    notes: '',
  });

  useEffect(() => {
    if (tithe) {
      setFormData({
        date: tithe.date,
        memberName: tithe.memberName,
        titheAmount: (tithe.titheAmount || tithe.amount || 0).toString(),
        tithePaymentMethod: tithe.tithePaymentMethod || (tithe.paymentMethod === 'transfer' ? 'transferencia' : 'efectivo'),
        titheTransferNumber: tithe.titheTransferNumber || tithe.reference || '',
        offeringAmount: (tithe.offeringAmount || 0).toString(),
        offeringPaymentMethod: tithe.offeringPaymentMethod || 'efectivo',
        offeringTransferNumber: tithe.offeringTransferNumber || '',
        notes: tithe.notes || '',
      });
    }
  }, [tithe]);

  const handleSubmit = () => {
    if (!tithe || !formData.memberName || !formData.date) return;

    const titheAmount = parseFloat(formData.titheAmount) || 0;
    const offeringAmount = parseFloat(formData.offeringAmount) || 0;

    const updatedTithe: TitheRecord = {
      ...tithe,
      date: formData.date,
      memberName: formData.memberName.trim(),
      titheAmount,
      tithePaymentMethod: formData.tithePaymentMethod,
      titheTransferNumber: formData.tithePaymentMethod === 'transferencia' ? formData.titheTransferNumber.trim() || undefined : undefined,
      offeringAmount,
      offeringPaymentMethod: formData.offeringPaymentMethod,
      offeringTransferNumber: formData.offeringPaymentMethod === 'transferencia' ? formData.offeringTransferNumber.trim() || undefined : undefined,
      notes: formData.notes.trim() || undefined,
      // Legacy fields
      amount: titheAmount + offeringAmount,
      paymentMethod: formData.tithePaymentMethod === 'transferencia' ? 'transfer' : 'cash',
      reference: formData.titheTransferNumber || formData.offeringTransferNumber || undefined,
    };

    onSubmit(updatedTithe);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Registro</DialogTitle>
          <DialogDescription>
            Actualice los datos del registro de diezmos y ofrendas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. Fecha */}
          <div className="space-y-2">
            <Label htmlFor="edit-date">1. Fecha *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* 2. Nombre del Miembro */}
          <div className="space-y-2">
            <Label htmlFor="edit-memberName">2. Nombre del Miembro *</Label>
            <Input
              id="edit-memberName"
              value={formData.memberName}
              onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              placeholder="Nombre completo del miembro"
              maxLength={100}
            />
          </div>

          {/* 3. Monto Diezmo */}
          <div className="space-y-2">
            <Label htmlFor="edit-titheAmount">3. Monto Diezmo</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
              <Input
                id="edit-titheAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.titheAmount}
                onChange={(e) => setFormData({ ...formData, titheAmount: e.target.value })}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>

          {/* 4. Forma Diezmo */}
          <div className="space-y-2">
            <Label htmlFor="edit-tithePaymentMethod">4. Forma (Diezmo)</Label>
            <Select
              value={formData.tithePaymentMethod}
              onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') => 
                setFormData({ ...formData, tithePaymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 5. Número de transferencia (Diezmo) */}
          {formData.tithePaymentMethod === 'transferencia' && (
            <div className="space-y-2">
              <Label htmlFor="edit-titheTransferNumber">5. Número de transferencia (Diezmo)</Label>
              <Input
                id="edit-titheTransferNumber"
                value={formData.titheTransferNumber}
                onChange={(e) => setFormData({ ...formData, titheTransferNumber: e.target.value })}
                placeholder="Número de referencia de la transferencia"
                maxLength={100}
              />
            </div>
          )}

          <div className="border-t border-border my-4" />

          {/* 6. Monto Ofrenda */}
          <div className="space-y-2">
            <Label htmlFor="edit-offeringAmount">6. Monto Ofrenda</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
              <Input
                id="edit-offeringAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.offeringAmount}
                onChange={(e) => setFormData({ ...formData, offeringAmount: e.target.value })}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>

          {/* 7. Forma Ofrenda */}
          <div className="space-y-2">
            <Label htmlFor="edit-offeringPaymentMethod">7. Forma (Ofrenda)</Label>
            <Select
              value={formData.offeringPaymentMethod}
              onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') => 
                setFormData({ ...formData, offeringPaymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 8. Número de transferencia (Ofrenda) */}
          {formData.offeringPaymentMethod === 'transferencia' && (
            <div className="space-y-2">
              <Label htmlFor="edit-offeringTransferNumber">8. Número de transferencia (Ofrenda)</Label>
              <Input
                id="edit-offeringTransferNumber"
                value={formData.offeringTransferNumber}
                onChange={(e) => setFormData({ ...formData, offeringTransferNumber: e.target.value })}
                placeholder="Número de referencia de la transferencia"
                maxLength={100}
              />
            </div>
          )}

          <div className="border-t border-border my-4" />

          {/* 9. Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">9. Observaciones</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.memberName.trim() || !formData.date}
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
