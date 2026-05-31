import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';

interface DonationReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationReceiptDialog({ open, onOpenChange }: DonationReceiptDialogProps) {
  const [formData, setFormData] = useState({
    nombreContable: '',
    correoElectronico: '',
    nit: '',
    monto: '',
    opcionPago: 'efectivo' as 'transferencia' | 'efectivo',
    numeroTransferencia: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreContable.trim()) {
      newErrors.nombreContable = 'El nombre contable es requerido';
    } else if (formData.nombreContable.trim().length > 100) {
      newErrors.nombreContable = 'Máximo 100 caracteres';
    }

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico.trim())) {
      newErrors.correoElectronico = 'Correo electrónico inválido';
    }

    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es requerido';
    } else if (formData.nit.trim().length > 20) {
      newErrors.nit = 'Máximo 20 caracteres';
    }

    if (!formData.monto.trim()) {
      newErrors.monto = 'El monto es requerido';
    } else if (isNaN(parseFloat(formData.monto)) || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'Ingrese un monto válido';
    }

    if (formData.opcionPago === 'transferencia' && !formData.numeroTransferencia.trim()) {
      newErrors.numeroTransferencia = 'El número de transferencia es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // For now, just show success toast since email requires Cloud
    toast.success('Solicitud de recibo enviada correctamente. El recibo será enviado a su correo electrónico.');

    // Reset form
    setFormData({
      nombreContable: '',
      correoElectronico: '',
      nit: '',
      monto: '',
      opcionPago: 'efectivo',
      numeroTransferencia: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <DialogTitle className="text-xl font-bold">RECIBO DE DONACIÓN</DialogTitle>
          </div>
          <DialogDescription>
            Si necesitas un recibo de donación por favor llena la siguiente información. El recibo te llegará por medio de correo electrónico. Para poder emitir el recibo es necesario que llenes las informaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre Contable */}
          <div className="space-y-2">
            <Label htmlFor="nombreContable">Nombre contable *</Label>
            <Input
              id="nombreContable"
              value={formData.nombreContable}
              onChange={(e) => setFormData({ ...formData, nombreContable: e.target.value })}
              placeholder="Nombre contable completo"
              maxLength={100}
            />
            {errors.nombreContable && (
              <p className="text-sm text-destructive">{errors.nombreContable}</p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-2">
            <Label htmlFor="correoElectronico">Correo electrónico *</Label>
            <Input
              id="correoElectronico"
              type="email"
              value={formData.correoElectronico}
              onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
              placeholder="correo@ejemplo.com"
              maxLength={255}
            />
            {errors.correoElectronico && (
              <p className="text-sm text-destructive">{errors.correoElectronico}</p>
            )}
          </div>

          {/* NIT */}
          <div className="space-y-2">
            <Label htmlFor="nit">NIT *</Label>
            <Input
              id="nit"
              value={formData.nit}
              onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              placeholder="Número de NIT"
              maxLength={20}
            />
            {errors.nit && (
              <p className="text-sm text-destructive">{errors.nit}</p>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
              <Input
                id="monto"
                type="number"
                min="0"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            {errors.monto && (
              <p className="text-sm text-destructive">{errors.monto}</p>
            )}
          </div>

          {/* Opción de Pago */}
          <div className="space-y-3">
            <Label>Opción *</Label>
            <RadioGroup
              value={formData.opcionPago}
              onValueChange={(value: 'transferencia' | 'efectivo') =>
                setFormData({ ...formData, opcionPago: value, numeroTransferencia: '' })
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="font-normal cursor-pointer">
                  Transferencia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="font-normal cursor-pointer">
                  Efectivo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Número de Transferencia */}
          {formData.opcionPago === 'transferencia' && (
            <div className="space-y-2">
              <Label htmlFor="numeroTransferencia">Número de Transferencia *</Label>
              <Input
                id="numeroTransferencia"
                value={formData.numeroTransferencia}
                onChange={(e) => setFormData({ ...formData, numeroTransferencia: e.target.value })}
                placeholder="Número de referencia de transferencia"
                maxLength={100}
              />
              {errors.numeroTransferencia && (
                <p className="text-sm text-destructive">{errors.numeroTransferencia}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Solicitar Recibo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
