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
import { TitheRecord, TitheCurrency } from './AddTitheDialog';
import { TitheCategoryFields } from './TitheCategoryFields';
import { emptyTitheFormState, formStateToTitheRecord } from '@/lib/titheRecords';

interface EditTitheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tithe: TitheRecord | null;
  onSubmit: (tithe: TitheRecord) => void;
}

export function EditTitheDialog({ open, onOpenChange, tithe, onSubmit }: EditTitheDialogProps) {
  const [formData, setFormData] = useState(emptyTitheFormState());

  useEffect(() => {
    if (tithe) {
      setFormData({
        date: tithe.date,
        memberName: tithe.memberName,
        currency: tithe.currency || 'GTQ',
        titheAmount: String(tithe.titheAmount || 0),
        tithePaymentMethod: tithe.tithePaymentMethod,
        titheTransferNumber: tithe.titheTransferNumber || '',
        offeringAmount: String(tithe.offeringAmount || 0),
        offeringPaymentMethod: tithe.offeringPaymentMethod,
        offeringTransferNumber: tithe.offeringTransferNumber || '',
        firstFruitsAmount: String(tithe.firstFruitsAmount || 0),
        firstFruitsPaymentMethod: tithe.firstFruitsPaymentMethod,
        firstFruitsTransferNumber: tithe.firstFruitsTransferNumber || '',
        proTemploAmount: String(tithe.proTemploAmount || 0),
        proTemploPaymentMethod: tithe.proTemploPaymentMethod,
        proTemploTransferNumber: tithe.proTemploTransferNumber || '',
        specialOfferingAmount: String(tithe.specialOfferingAmount || 0),
        specialOfferingPaymentMethod: tithe.specialOfferingPaymentMethod,
        specialOfferingTransferNumber: tithe.specialOfferingTransferNumber || '',
        notes: tithe.notes || '',
      });
    }
  }, [tithe]);

  const handleSubmit = () => {
    if (!tithe || !formData.memberName.trim() || !formData.date) return;
    onSubmit(formStateToTitheRecord(formData, tithe.id));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Registro</DialogTitle>
          <DialogDescription>Actualice los datos del registro de diezmos y ofrendas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-memberName">Nombre del Miembro *</Label>
            <Input
              id="edit-memberName"
              value={formData.memberName}
              onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select
              value={formData.currency}
              onValueChange={(value: TitheCurrency) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTQ">Quetzal (Q)</SelectItem>
                <SelectItem value="USD">Dólar ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TitheCategoryFields
            title="Diezmo"
            open
            onOpenChange={() => undefined}
            currency={formData.currency}
            amountId="edit-titheAmount"
            methodId="edit-tithePaymentMethod"
            transferId="edit-titheTransferNumber"
            fields={{
              amount: formData.titheAmount,
              paymentMethod: formData.tithePaymentMethod,
              transferNumber: formData.titheTransferNumber,
            }}
            onChange={(fields) =>
              setFormData({
                ...formData,
                titheAmount: fields.amount,
                tithePaymentMethod: fields.paymentMethod,
                titheTransferNumber: fields.transferNumber,
              })
            }
          />

          <TitheCategoryFields
            title="Ofrenda"
            open
            onOpenChange={() => undefined}
            currency={formData.currency}
            amountId="edit-offeringAmount"
            methodId="edit-offeringPaymentMethod"
            transferId="edit-offeringTransferNumber"
            fields={{
              amount: formData.offeringAmount,
              paymentMethod: formData.offeringPaymentMethod,
              transferNumber: formData.offeringTransferNumber,
            }}
            onChange={(fields) =>
              setFormData({
                ...formData,
                offeringAmount: fields.amount,
                offeringPaymentMethod: fields.paymentMethod,
                offeringTransferNumber: fields.transferNumber,
              })
            }
          />

          <TitheCategoryFields
            title="Primicia"
            open
            onOpenChange={() => undefined}
            currency={formData.currency}
            amountId="edit-firstFruitsAmount"
            methodId="edit-firstFruitsPaymentMethod"
            transferId="edit-firstFruitsTransferNumber"
            fields={{
              amount: formData.firstFruitsAmount,
              paymentMethod: formData.firstFruitsPaymentMethod,
              transferNumber: formData.firstFruitsTransferNumber,
            }}
            onChange={(fields) =>
              setFormData({
                ...formData,
                firstFruitsAmount: fields.amount,
                firstFruitsPaymentMethod: fields.paymentMethod,
                firstFruitsTransferNumber: fields.transferNumber,
              })
            }
          />

          <TitheCategoryFields
            title="ProTemplo"
            open
            onOpenChange={() => undefined}
            currency={formData.currency}
            amountId="edit-proTemploAmount"
            methodId="edit-proTemploPaymentMethod"
            transferId="edit-proTemploTransferNumber"
            fields={{
              amount: formData.proTemploAmount,
              paymentMethod: formData.proTemploPaymentMethod,
              transferNumber: formData.proTemploTransferNumber,
            }}
            onChange={(fields) =>
              setFormData({
                ...formData,
                proTemploAmount: fields.amount,
                proTemploPaymentMethod: fields.paymentMethod,
                proTemploTransferNumber: fields.transferNumber,
              })
            }
          />

          <TitheCategoryFields
            title="Ofrenda Especial"
            open
            onOpenChange={() => undefined}
            currency={formData.currency}
            amountId="edit-specialOfferingAmount"
            methodId="edit-specialOfferingPaymentMethod"
            transferId="edit-specialOfferingTransferNumber"
            fields={{
              amount: formData.specialOfferingAmount,
              paymentMethod: formData.specialOfferingPaymentMethod,
              transferNumber: formData.specialOfferingTransferNumber,
            }}
            onChange={(fields) =>
              setFormData({
                ...formData,
                specialOfferingAmount: fields.amount,
                specialOfferingPaymentMethod: fields.paymentMethod,
                specialOfferingTransferNumber: fields.transferNumber,
              })
            }
          />

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observaciones</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.memberName.trim() || !formData.date}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
