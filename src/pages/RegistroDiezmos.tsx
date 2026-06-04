import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CheckCircle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TitheCategoryFields } from '@/components/tithes/TitheCategoryFields';
import { TitheCurrency } from '@/components/tithes/AddTitheDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  emptyTitheFormState,
  formStateToTitheRecord,
  titheRecordToRow,
} from '@/lib/titheRecords';

export default function RegistroDiezmos() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyTitheFormState);

  const [titheOpen, setTitheOpen] = useState(true);
  const [offeringOpen, setOfferingOpen] = useState(true);
  const [firstFruitsOpen, setFirstFruitsOpen] = useState(true);
  const [proTemploOpen, setProTemploOpen] = useState(true);
  const [specialOfferingOpen, setSpecialOfferingOpen] = useState(true);

  const handleSubmit = async () => {
    if (!formData.memberName.trim() || !formData.date) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    setSaving(true);
    const record = formStateToTitheRecord(formData);
    const { error } = await supabase.from('tithe_records').insert(titheRecordToRow(record));

    setSaving(false);
    if (error) {
      toast.error('No se pudo guardar el registro');
      return;
    }

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
                El diezmo/ofrenda ha sido registrado correctamente en la base de datos.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSubmitted(false);
                  setFormData(emptyTitheFormState());
                }}
              >
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
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Banknote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Control de Diezmos y Ofrendas
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete los datos para registrar diezmos, ofrendas y primicias.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">1. Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

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

              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: TitheCurrency) =>
                    setFormData({ ...formData, currency: value })
                  }
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
                open={titheOpen}
                onOpenChange={setTitheOpen}
                currency={formData.currency}
                amountId="titheAmount"
                methodId="tithePaymentMethod"
                transferId="titheTransferNumber"
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
                open={offeringOpen}
                onOpenChange={setOfferingOpen}
                currency={formData.currency}
                amountId="offeringAmount"
                methodId="offeringPaymentMethod"
                transferId="offeringTransferNumber"
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
                open={firstFruitsOpen}
                onOpenChange={setFirstFruitsOpen}
                currency={formData.currency}
                amountId="firstFruitsAmount"
                methodId="firstFruitsPaymentMethod"
                transferId="firstFruitsTransferNumber"
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
                open={proTemploOpen}
                onOpenChange={setProTemploOpen}
                currency={formData.currency}
                amountId="proTemploAmount"
                methodId="proTemploPaymentMethod"
                transferId="proTemploTransferNumber"
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
                open={specialOfferingOpen}
                onOpenChange={setSpecialOfferingOpen}
                currency={formData.currency}
                amountId="specialOfferingAmount"
                methodId="specialOfferingPaymentMethod"
                transferId="specialOfferingTransferNumber"
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

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-center pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.memberName.trim() || !formData.date || saving}
                >
                  {saving ? 'Guardando...' : 'Registrar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
