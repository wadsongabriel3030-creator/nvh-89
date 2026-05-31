import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Receipt, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function ReciboDonacion() {
  const [submitted, setSubmitted] = useState(false);
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
    if (!formData.nombreContable.trim()) newErrors.nombreContable = 'El nombre contable es requerido';
    else if (formData.nombreContable.trim().length > 100) newErrors.nombreContable = 'Máximo 100 caracteres';
    if (!formData.correoElectronico.trim()) newErrors.correoElectronico = 'El correo electrónico es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico.trim())) newErrors.correoElectronico = 'Correo electrónico inválido';
    if (!formData.nit.trim()) newErrors.nit = 'El NIT es requerido';
    else if (formData.nit.trim().length > 20) newErrors.nit = 'Máximo 20 caracteres';
    if (!formData.monto.trim()) newErrors.monto = 'El monto es requerido';
    else if (isNaN(parseFloat(formData.monto)) || parseFloat(formData.monto) <= 0) newErrors.monto = 'Ingrese un monto válido';
    if (formData.opcionPago === 'transferencia' && !formData.numeroTransferencia.trim()) newErrors.numeroTransferencia = 'El número de transferencia es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    toast.success('Solicitud de recibo enviada correctamente.');
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      nombreContable: '',
      correoElectronico: '',
      nit: '',
      monto: '',
      opcionPago: 'efectivo',
      numeroTransferencia: '',
    });
    setErrors({});
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
              <h2 className="text-2xl font-bold text-foreground">¡Solicitud enviada!</h2>
              <p className="text-muted-foreground">
                El recibo será enviado a su correo electrónico.
              </p>
              <Button className="mt-4" onClick={handleReset}>
                Solicitar otro recibo
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
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Receipt className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">RECIBO DE DONACIÓN</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Si necesitas un recibo de donación por favor llena la siguiente información. El recibo te llegará por medio de correo electrónico.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombreContable">Nombre contable *</Label>
                <Input
                  id="nombreContable"
                  value={formData.nombreContable}
                  onChange={(e) => setFormData({ ...formData, nombreContable: e.target.value })}
                  placeholder="Nombre contable completo"
                  maxLength={100}
                />
                {errors.nombreContable && <p className="text-sm text-destructive">{errors.nombreContable}</p>}
              </div>

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
                {errors.correoElectronico && <p className="text-sm text-destructive">{errors.correoElectronico}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nit">NIT *</Label>
                <Input
                  id="nit"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  placeholder="Número de NIT"
                  maxLength={20}
                />
                {errors.nit && <p className="text-sm text-destructive">{errors.nit}</p>}
              </div>

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
                {errors.monto && <p className="text-sm text-destructive">{errors.monto}</p>}
              </div>

              <div className="space-y-3">
                <Label>Opción *</Label>
                <RadioGroup
                  value={formData.opcionPago}
                  onValueChange={(value: 'transferencia' | 'efectivo') =>
                    setFormData({ ...formData, opcionPago: value, numeroTransferencia: '' })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="transferencia" id="transferencia" />
                    <Label htmlFor="transferencia" className="font-normal cursor-pointer flex-1">Transferencia</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="efectivo" id="efectivo" />
                    <Label htmlFor="efectivo" className="font-normal cursor-pointer flex-1">Efectivo</Label>
                  </div>
                </RadioGroup>
              </div>

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
                  {errors.numeroTransferencia && <p className="text-sm text-destructive">{errors.numeroTransferencia}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-6 border-t mt-6">
              <Button onClick={handleSubmit} className="gap-2">
                <Send className="w-4 h-4" />
                Solicitar Recibo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
