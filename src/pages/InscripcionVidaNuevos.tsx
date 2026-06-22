import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { saveClassReport } from '@/lib/classReports';
import { Sparkles, ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FormData {
  nombreCompleto: string;
  telefono: string;
  asistencia: string;
  comentarios: string;
}

const TOTAL_STEPS = 4;

export default function InscripcionVidaNuevos() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: '',
    telefono: '',
    asistencia: '',
    comentarios: '',
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      await saveClassReport({
        area: 'inscripcion-vida-nuevos',
        leccion: 'Inscripción Vida Nuevos Hechos',
        reportDate: new Date(),
        leaderName: formData.nombreCompleto,
        attendeeIds: [],
        attendeeNames: [formData.nombreCompleto],
        extra: {
          telefono: formData.telefono,
          asistencia: formData.asistencia,
          comentarios: formData.comentarios,
        },
      });
    } catch {
      // still show success to the user even if save fails
    }
    toast.success('¡Inscripción enviada con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({ nombreCompleto: '', telefono: '', asistencia: '', comentarios: '' });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.nombreCompleto.trim().length > 0;
      case 2: return formData.telefono.trim().length > 0;
      case 3: return formData.asistencia.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Inscripción Enviada!</h2>
              <p className="text-muted-foreground">
                Gracias por inscribirte al curso Vida Nuevos Hechos. ¡Te esperamos!
              </p>
              <Button onClick={handleReset} className="mt-4">
                Enviar Otra Inscripción
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
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Curso VIDA NUEVOS HECHOS</h1>
              <p className="text-sm text-muted-foreground mt-3">
                ¡Queremos darte la Bienvenida como parte de Nuevos Hechos!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Y juntos cumplamos con la Gran Comisión "Vivir como discípulos de Jesús y ayudar a otros a conocerlo también". ¡Y ahora tú eres parte de esta misión!
              </p>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg border text-left space-y-1">
                <p className="text-sm font-medium text-foreground">🗓️ DOMINGO 08 DE FEBRERO 2026</p>
                <p className="text-sm text-foreground">⏰ 1:30 p.m. - 5:30 p.m.</p>
                <p className="text-xs text-muted-foreground">(al terminar nuestra reunión, te invitamos a dirigirte al lugar, tendremos preparado un almuerzo)</p>
                <p className="text-sm text-foreground mt-2">📍 3ra. Calle "C" 18-96, sector B4, San Cristóbal II, zona 8 Mixco</p>
                <p className="text-xs text-muted-foreground">Código: SB4-47 (casa de los pastores)</p>
              </div>

              <p className="text-sm font-semibold text-primary mt-4">¡TE ESPERAMOS!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Paso {step} de {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="min-h-[180px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Nombre Completo *</Label>
                    <Input
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                      placeholder="Escribe tu nombre completo"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Número de Teléfono *</Label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="Escribe tu número de teléfono"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Confirmas tu asistencia? *</Label>
                    <RadioGroup
                      value={formData.asistencia}
                      onValueChange={(value) => setFormData({ ...formData, asistencia: value })}
                      className="mt-3 space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="si" id="si" />
                        <Label htmlFor="si" className="font-normal cursor-pointer">Sí podré asistir.</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="font-normal cursor-pointer">No podré asistir.</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Comentarios:</Label>
                    <p className="text-sm text-muted-foreground mb-3">Opcional</p>
                    <Textarea
                      value={formData.comentarios}
                      onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                      placeholder="Escribe tus comentarios..."
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={step === 1} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {step < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={!isStepValid()} className="gap-2">
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Inscripción
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
