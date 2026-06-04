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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TithePaymentMethod = 'efectivo' | 'transferencia' | 'cheque';
export type TitheCurrency = 'GTQ' | 'USD';
export type TitheCategory =
  | 'diezmo'
  | 'ofrenda'
  | 'primicia'
  | 'pro_templo'
  | 'ofrenda_especial';

export interface TitheRecord {
  id: string;
  memberName: string;
  date: string;
  currency: TitheCurrency;
  titheAmount: number;
  tithePaymentMethod: TithePaymentMethod;
  titheTransferNumber?: string;
  offeringAmount: number;
  offeringPaymentMethod: TithePaymentMethod;
  offeringTransferNumber?: string;
  firstFruitsAmount: number;
  firstFruitsPaymentMethod: TithePaymentMethod;
  firstFruitsTransferNumber?: string;
  proTemploAmount: number;
  proTemploPaymentMethod: TithePaymentMethod;
  proTemploTransferNumber?: string;
  specialOfferingAmount: number;
  specialOfferingPaymentMethod: TithePaymentMethod;
  specialOfferingTransferNumber?: string;
  notes?: string;
  createdAt: string;
  // Legacy fields for compatibility
  amount: number;
  paymentMethod: 'cash' | 'transfer';
  reference?: string;
}

interface AddTitheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tithe: TitheRecord) => void;
}

export function AddTitheDialog({ open, onOpenChange, onSubmit }: AddTitheDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memberName: '',
    titheAmount: '',
    tithePaymentMethod: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque',
    titheTransferNumber: '',
    offeringAmount: '',
    offeringPaymentMethod: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque',
    offeringTransferNumber: '',
    firstFruitsAmount: '',
    firstFruitsPaymentMethod: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque',
    firstFruitsTransferNumber: '',
    notes: '',
  });

  const [titheOpen, setTitheOpen] = useState(true);
  const [offeringOpen, setOfferingOpen] = useState(true);
  const [firstFruitsOpen, setFirstFruitsOpen] = useState(true);

  const handleSubmit = () => {
    if (!formData.memberName || !formData.date) return;

    const titheAmount = parseFloat(formData.titheAmount) || 0;
    const offeringAmount = parseFloat(formData.offeringAmount) || 0;
    const firstFruitsAmount = parseFloat(formData.firstFruitsAmount) || 0;

    const newTithe: TitheRecord = {
      id: Date.now().toString(),
      date: formData.date,
      memberName: formData.memberName.trim(),
      currency: 'GTQ',
      titheAmount,
      tithePaymentMethod: formData.tithePaymentMethod,
      titheTransferNumber: formData.tithePaymentMethod === 'transferencia' ? formData.titheTransferNumber.trim() || undefined : undefined,
      offeringAmount,
      offeringPaymentMethod: formData.offeringPaymentMethod,
      offeringTransferNumber: formData.offeringPaymentMethod === 'transferencia' ? formData.offeringTransferNumber.trim() || undefined : undefined,
      firstFruitsAmount,
      firstFruitsPaymentMethod: formData.firstFruitsPaymentMethod,
      firstFruitsTransferNumber: formData.firstFruitsPaymentMethod === 'transferencia' ? formData.firstFruitsTransferNumber.trim() || undefined : undefined,
      proTemploAmount: 0,
      proTemploPaymentMethod: 'efectivo',
      specialOfferingAmount: 0,
      specialOfferingPaymentMethod: 'efectivo',
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      // Legacy fields
      amount: titheAmount + offeringAmount + firstFruitsAmount,
      paymentMethod: formData.tithePaymentMethod === 'transferencia' ? 'transfer' : 'cash',
      reference: formData.titheTransferNumber || formData.offeringTransferNumber || formData.firstFruitsTransferNumber || undefined,
    };

    onSubmit(newTithe);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      memberName: '',
      titheAmount: '',
      tithePaymentMethod: 'efectivo',
      titheTransferNumber: '',
      offeringAmount: '',
      offeringPaymentMethod: 'efectivo',
      offeringTransferNumber: '',
      firstFruitsAmount: '',
      firstFruitsPaymentMethod: 'efectivo',
      firstFruitsTransferNumber: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">CONTROL DE DIEZMOS Y OFRENDAS</DialogTitle>
          <DialogDescription>
            Complete los datos para registrar diezmos, ofrendas y primicias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">1. Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* 2. Nombre del Miembro */}
          <div className="space-y-2">
            <Label htmlFor="memberName">2. Nombre del Miembro *</Label>
            <Input
              id="memberName"
              value={formData.memberName}
              onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              placeholder="Nombre completo del miembro"
              maxLength={100}
            />
          </div>

          {/* Diezmo Section */}
          <Collapsible open={titheOpen} onOpenChange={setTitheOpen} className="border border-border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-t-lg transition-colors">
              <span className="font-semibold text-foreground">Diezmo</span>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", titheOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              {/* Monto Diezmo */}
              <div className="space-y-2">
                <Label htmlFor="titheAmount">Monto Diezmo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
                  <Input
                    id="titheAmount"
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

              {/* Forma Diezmo */}
              <div className="space-y-2">
                <Label htmlFor="tithePaymentMethod">Forma (Diezmo)</Label>
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

              {/* Número de transferencia (Diezmo) */}
              {formData.tithePaymentMethod === 'transferencia' && (
                <div className="space-y-2">
                  <Label htmlFor="titheTransferNumber">Número de transferencia</Label>
                  <Input
                    id="titheTransferNumber"
                    value={formData.titheTransferNumber}
                    onChange={(e) => setFormData({ ...formData, titheTransferNumber: e.target.value })}
                    placeholder="Número de referencia"
                    maxLength={100}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Ofrenda Section */}
          <Collapsible open={offeringOpen} onOpenChange={setOfferingOpen} className="border border-border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-t-lg transition-colors">
              <span className="font-semibold text-foreground">Ofrenda</span>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", offeringOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              {/* Monto Ofrenda */}
              <div className="space-y-2">
                <Label htmlFor="offeringAmount">Monto Ofrenda</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
                  <Input
                    id="offeringAmount"
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

              {/* Forma Ofrenda */}
              <div className="space-y-2">
                <Label htmlFor="offeringPaymentMethod">Forma (Ofrenda)</Label>
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

              {/* Número de transferencia (Ofrenda) */}
              {formData.offeringPaymentMethod === 'transferencia' && (
                <div className="space-y-2">
                  <Label htmlFor="offeringTransferNumber">Número de transferencia</Label>
                  <Input
                    id="offeringTransferNumber"
                    value={formData.offeringTransferNumber}
                    onChange={(e) => setFormData({ ...formData, offeringTransferNumber: e.target.value })}
                    placeholder="Número de referencia"
                    maxLength={100}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Primicia Section */}
          <Collapsible open={firstFruitsOpen} onOpenChange={setFirstFruitsOpen} className="border border-border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-t-lg transition-colors">
              <span className="font-semibold text-foreground">Primicia</span>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", firstFruitsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              {/* Monto Primicia */}
              <div className="space-y-2">
                <Label htmlFor="firstFruitsAmount">Monto Primicia</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Q</span>
                  <Input
                    id="firstFruitsAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.firstFruitsAmount}
                    onChange={(e) => setFormData({ ...formData, firstFruitsAmount: e.target.value })}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Forma Primicia */}
              <div className="space-y-2">
                <Label htmlFor="firstFruitsPaymentMethod">Forma (Primicia)</Label>
                <Select
                  value={formData.firstFruitsPaymentMethod}
                  onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') => 
                    setFormData({ ...formData, firstFruitsPaymentMethod: value })
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

              {/* Número de transferencia (Primicia) */}
              {formData.firstFruitsPaymentMethod === 'transferencia' && (
                <div className="space-y-2">
                  <Label htmlFor="firstFruitsTransferNumber">Número de transferencia</Label>
                  <Input
                    id="firstFruitsTransferNumber"
                    value={formData.firstFruitsTransferNumber}
                    onChange={(e) => setFormData({ ...formData, firstFruitsTransferNumber: e.target.value })}
                    placeholder="Número de referencia"
                    maxLength={100}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
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
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
