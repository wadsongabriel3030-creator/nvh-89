import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Heart, ChevronLeft, ChevronRight, Send, CheckCircle, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface PrimeraVezFormData {
  nombre: string;
  telefono: string;
  punto: string;
  oracionOpciones: string[];
  oracionOtros: string;
  invitadoPor: string;
  comentarios: string;
}

const TOTAL_STEPS = 6;

const OPCIONES_PUNTO = [
  'Solo estoy explorando',
  'Tengo muchas preguntas',
  'Estoy retomando mi fe',
  'Ya camino con Jesús',
  'No estoy seguro aún',
];

export default function PrimeraVez() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<PrimeraVezFormData>({
    nombre: '',
    telefono: '',
    punto: '',
    oracionOpciones: [],
    oracionOtros: '',
    invitadoPor: '',
    comentarios: '',
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const submittedAt = new Date();
    const payload = {
      ...formData,
      submittedAt: submittedAt.toISOString(),
      submittedAtLocal: submittedAt.toLocaleString('es-ES'),
    };
    // eslint-disable-next-line no-console
    console.log('[PrimeraVez] Registro enviado:', payload);
    try {
      const raw = localStorage.getItem('primera-vez-submissions');
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now().toString(),
        ...payload,
      };
      list.unshift(entry);
      localStorage.setItem('primera-vez-submissions', JSON.stringify(list));
      window.dispatchEvent(new Event('primera-vez-updated'));
    } catch {
      // ignore
    }
    toast.success('¡Registro enviado con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      nombre: '',
      telefono: '',
      punto: '',
      oracionOpciones: [],
      oracionOtros: '',
      invitadoPor: '',
      comentarios: '',
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.nombre.trim().length > 0;
      case 2: return formData.telefono.trim().length > 0;
      case 3: return formData.punto.trim().length > 0;
      case 4: return true;
      case 5: return formData.invitadoPor.trim().length > 0;
      case 6: return true;
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
              <h2 className="text-2xl font-bold text-foreground">¡Gracias por registrarte!</h2>
              <p className="text-muted-foreground">
                Nos pondremos en contacto contigo esta semana. ¡Bienvenido a Nuevos Hechos!
              </p>
              <div className="mt-6 p-4 rounded-lg border border-primary/30 bg-primary/5 text-center space-y-2">
                <p className="text-sm text-foreground font-medium">
                  Presiona AQUÍ, para obtener más información sobre Nosotros.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Recuerda: La Historia de Dios Continúa
                </p>
                <a
                  href="https://conexionministerios.org/nuevos-hechos/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="mt-2 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Conoce Nuevos Hechos
                  </Button>
                </a>
              </div>
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
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">¡Bienvenido a Nuevos Hechos!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                ¡Gracias por acompañarnos!
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Nos gustaría conocerte y poder saludarte esta semana dándote una buena bienvenida (la bienvenida que te mereces).
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
                    <Label className="text-base font-semibold">¿Cómo te llamas? *</Label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Escribe tu nombre completo"
                      className="mt-3"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿A qué número podemos escribirte esta semana para saludarte? *</Label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+XX XXXX-XXXX"
                      className="mt-3"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿En qué punto dirías que estás hoy? *</Label>
                    <RadioGroup
                      value={formData.punto}
                      onValueChange={(value) => setFormData({ ...formData, punto: value })}
                      className="mt-3 space-y-3"
                    >
                      {OPCIONES_PUNTO.map((opcion) => (
                        <div key={opcion} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={opcion} id={opcion} />
                          <Label htmlFor={opcion} className="cursor-pointer flex-1">{opcion}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Hay algo por lo que necesites oración hoy?</Label>
                    <p className="text-sm text-muted-foreground mb-3">(Opcional)</p>
                    <div className="space-y-3 mt-3">
                      {['Familia', 'Finanzas', 'Salud', 'Trabajo'].map((opcion) => (
                        <div key={opcion} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`oracion-${opcion}`}
                            checked={formData.oracionOpciones.includes(opcion)}
                            onCheckedChange={(checked) => {
                              const updated = checked
                                ? [...formData.oracionOpciones, opcion]
                                : formData.oracionOpciones.filter((o) => o !== opcion);
                              setFormData({ ...formData, oracionOpciones: updated });
                            }}
                          />
                          <Label htmlFor={`oracion-${opcion}`} className="cursor-pointer flex-1">{opcion}</Label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="oracion-otros"
                          checked={formData.oracionOpciones.includes('Otros')}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...formData.oracionOpciones, 'Otros']
                              : formData.oracionOpciones.filter((o) => o !== 'Otros');
                            setFormData({ ...formData, oracionOpciones: updated, oracionOtros: checked ? formData.oracionOtros : '' });
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor="oracion-otros" className="cursor-pointer">Escribe tu petición</Label>
                          {formData.oracionOpciones.includes('Otros') && (
                            <Textarea
                              value={formData.oracionOtros}
                              onChange={(e) => setFormData({ ...formData, oracionOtros: e.target.value })}
                              placeholder="Escribe tu petición de oración..."
                              rows={3}
                              className="mt-2 resize-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Quién te invitó? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">Cuéntanos el nombre de la persona que te invitó.</p>
                    <Input
                      value={formData.invitadoPor}
                      onChange={(e) => setFormData({ ...formData, invitadoPor: e.target.value })}
                      placeholder="Nombre de quien te invitó"
                      className="mt-3"
                    />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Algo más que quieras compartir con nosotros?</Label>
                    <p className="text-sm text-muted-foreground mb-3">(Opcional)</p>
                    <Textarea
                      value={formData.comentarios}
                      onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                      placeholder="Escribe aquí cualquier comentario adicional..."
                      rows={4}
                      className="mt-3 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Al enviar, registraremos automáticamente la fecha y hora de tu respuesta.
                    </p>
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
