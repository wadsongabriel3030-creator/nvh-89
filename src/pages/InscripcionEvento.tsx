import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarCheck, ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface InscripcionEventoFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  observaciones: string;
}

const TOTAL_STEPS = 4;

export default function InscripcionEvento() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const eventName = eventSlug ? decodeURIComponent(eventSlug).replace(/-/g, ' ') : 'Evento';
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<InscripcionEventoFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    observaciones: '',
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast.success('¡Inscripción enviada con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({ nombre: '', apellido: '', telefono: '', observaciones: '' });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.nombre.trim().length > 0;
      case 2: return formData.apellido.trim().length > 0;
      case 3: return formData.telefono.trim().length > 0;
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
                Tu inscripción ha sido registrada exitosamente. ¡Te esperamos!
              </p>
              <Button onClick={handleReset} className="mt-4">
                Registrar Otra Persona
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
                  <CalendarCheck className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground capitalize">{eventName}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Completa tus datos para inscribirte en este evento.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Paso {step} de {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="min-h-[200px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Nombre *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      ¿Cuál es tu nombre?
                    </p>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Escribe tu nombre"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Apellido *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      ¿Cuál es tu apellido?
                    </p>
                    <Input
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      placeholder="Escribe tu apellido"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Teléfono *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      ¿A qué número podemos contactarte?
                    </p>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+XX XXXX-XXXX"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Observaciones</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      (Opcional) ¿Algo que quieras agregar?
                    </p>
                    <Textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      placeholder="Escribe tus observaciones..."
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
