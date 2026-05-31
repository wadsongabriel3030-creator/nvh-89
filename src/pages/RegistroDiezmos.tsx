import { useState } from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronDown, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TitheRecord } from '@/components/tithes/AddTitheDialog';
import { toast } from 'sonner';

export default function RegistroDiezmos() {
  const [submitted, setSubmitted] = useState(false);
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
    if (!formData.memberName || !formData.date) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    const titheAmount = parseFloat(formData.titheAmount) || 0;
    const offeringAmount = parseFloat(formData.offeringAmount) || 0;
    const firstFruitsAmount = parseFloat(formData.firstFruitsAmount) || 0;

    const newTithe: TitheRecord = {
      id: Date.now().toString(),
      date: formData.date,
      memberName: formData.memberName.trim(),
      titheAmount,
      tithePaymentMethod: formData.tithePaymentMethod,
      titheTransferNumber: formData.tithePaymentMethod === 'transferencia' ? formData.titheTransferNumber.trim() || undefined : undefined,
      offeringAmount,
      offeringPaymentMethod: formData.offeringPaymentMethod,
      offeringTransferNumber: formData.offeringPaymentMethod === 'transferencia' ? formData.offeringTransferNumber.trim() || undefined : undefined,
      firstFruitsAmount,
      firstFruitsPaymentMethod: formData.firstFruitsPaymentMethod,
      firstFruitsTransferNumber: formData.firstFruitsPaymentMethod === 'transferencia' ? formData.firstFruitsTransferNumber.trim() || undefined : undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      amount: titheAmount + offeringAmount + firstFruitsAmount,
      paymentMethod: formData.tithePaymentMethod === 'transferencia' ? 'transfer' : 'cash',
      reference: formData.titheTransferNumber || formData.offeringTransferNumber || formData.firstFruitsTransferNumber || undefined,
    };

    // Store in sessionStorage so the Tithes page can pick it up
    const pending = JSON.parse(sessionStorage.getItem('pendingTithe') || '[]');
    pending.push(newTithe);
    sessionStorage.setItem('pendingTithe', JSON.stringify(pending));

    toast.success('Diezmo registrado con éxito!');
    setSubmitted(true);
  };


  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Registro exitoso!</h2>
              <p className="text-muted-foreground">
                El diezmo/ofrenda ha sido registrado correctamente.
              </p>
              <Button className="mt-4" onClick={() => {
                setSubmitted(false);
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
              }}>
                Registrar otro
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Banknote className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Control de Diezmos y Ofrendas</h1>
            <p className="text-sm text-muted-foreground">Complete los datos para registrar diezmos, ofrendas y primicias.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="tithePaymentMethod">Forma (Diezmo)</Label>
                  <Select
                    value={formData.tithePaymentMethod}
                    onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') =>
                      setFormData({ ...formData, tithePaymentMethod: value })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione la forma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="offeringPaymentMethod">Forma (Ofrenda)</Label>
                  <Select
                    value={formData.offeringPaymentMethod}
                    onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') =>
                      setFormData({ ...formData, offeringPaymentMethod: value })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione la forma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="firstFruitsPaymentMethod">Forma (Primicia)</Label>
                  <Select
                    value={formData.firstFruitsPaymentMethod}
                    onValueChange={(value: 'efectivo' | 'transferencia' | 'cheque') =>
                      setFormData({ ...formData, firstFruitsPaymentMethod: value })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione la forma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!formData.memberName.trim() || !formData.date}
              >
                Registrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </MainLayout>
  );
}
