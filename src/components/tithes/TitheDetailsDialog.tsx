import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Banknote, User, FileText, CreditCard, Gift } from 'lucide-react';
import { TitheRecord } from './AddTitheDialog';
import { cn } from '@/lib/utils';

interface TitheDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tithe: TitheRecord | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function TitheDetailsDialog({ open, onOpenChange, tithe, onEdit, onDelete }: TitheDetailsDialogProps) {
  if (!tithe) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Q ${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const paymentMethodLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cheque: 'Cheque',
    cash: 'Efectivo',
    transfer: 'Transferencia',
  };

  const paymentMethodColors: Record<string, string> = {
    efectivo: 'bg-green-500/10 text-green-600',
    transferencia: 'bg-blue-500/10 text-blue-600',
    cheque: 'bg-amber-500/10 text-amber-600',
    cash: 'bg-green-500/10 text-green-600',
    transfer: 'bg-blue-500/10 text-blue-600',
  };

  const tithePaymentMethod = tithe.tithePaymentMethod || (tithe.paymentMethod === 'transfer' ? 'transferencia' : 'efectivo');
  const offeringPaymentMethod = tithe.offeringPaymentMethod || 'efectivo';
  const titheAmount = tithe.titheAmount || tithe.amount || 0;
  const offeringAmount = tithe.offeringAmount || 0;
  const totalAmount = titheAmount + offeringAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">Detalles del Registro</DialogTitle>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Detalles del registro de diezmos y ofrendas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fecha */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground capitalize">{formatDate(tithe.date)}</p>
            </div>
          </div>

          {/* Miembro */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Nombre del Miembro</p>
              <p className="text-sm text-muted-foreground">{tithe.memberName}</p>
            </div>
          </div>

          <Separator />

          {/* Diezmo */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Diezmo</h4>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monto</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(titheAmount)}</p>
              </div>
              <Badge className={cn('border-0', paymentMethodColors[tithePaymentMethod])}>
                {paymentMethodLabels[tithePaymentMethod]}
              </Badge>
            </div>
            {tithePaymentMethod === 'transferencia' && tithe.titheTransferNumber && (
              <div className="flex items-center gap-3 pl-12">
                <div>
                  <p className="text-xs text-muted-foreground">Número de transferencia</p>
                  <p className="text-sm">{tithe.titheTransferNumber}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Ofrenda */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Ofrenda</h4>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monto</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(offeringAmount)}</p>
              </div>
              <Badge className={cn('border-0', paymentMethodColors[offeringPaymentMethod])}>
                {paymentMethodLabels[offeringPaymentMethod]}
              </Badge>
            </div>
            {offeringPaymentMethod === 'transferencia' && tithe.offeringTransferNumber && (
              <div className="flex items-center gap-3 pl-12">
                <div>
                  <p className="text-xs text-muted-foreground">Número de transferencia</p>
                  <p className="text-sm">{tithe.offeringTransferNumber}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Observaciones */}
          {tithe.notes && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Observaciones</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tithe.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="destructive" onClick={onDelete} className="w-full sm:w-auto">
            Eliminar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cerrar
          </Button>
          <Button onClick={onEdit} className="w-full sm:w-auto">
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
