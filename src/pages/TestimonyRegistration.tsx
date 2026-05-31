import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Quote, ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface TestimonyFormData {
  authorName: string;
  situation: string;
  action: string;
  response: string;
}

const TOTAL_STEPS = 4;

export default function TestimonyRegistration() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<TestimonyFormData>({
    authorName: '',
    situation: '',
    action: '',
    response: '',
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('¡Testimonio enviado con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      authorName: '',
      situation: '',
      action: '',
      response: '',
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.authorName.trim().length > 0;
      case 2:
        return formData.situation.trim().length > 0;
      case 3:
        return formData.action.trim().length > 0;
      case 4:
        return formData.response.trim().length > 0;
      default:
        return false;
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
              <h2 className="text-2xl font-bold text-foreground">¡Testimonio Enviado!</h2>
              <p className="text-muted-foreground">
                Gracias por compartir tu testimonio. Será revisado y publicado pronto.
              </p>
              <Button onClick={handleReset} className="mt-4">
                Enviar Otro Testimonio
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
                  <Quote className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">TESTIMONIOS</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Comparte lo que has visto que Dios ha hecho, en ti o en otras personas.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Este formulario es una guía para ayudar a expresar cómo el Señor ha intervenido en medio de situaciones.
              </p>
              <p className="text-xs text-primary font-medium mt-2">
                ¡Recuerda! ¡Cada vida se convierte en la Historia de Dios!
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
                      Nombre de quien se relata el Testimonio
                    </p>
                    <Input
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="Escribe el nombre completo de la persona cuyo testimonio deseas compartir"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Cuál fue la situación? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Describa brevemente, la situación por la que se estaba atravesando.
                    </p>
                    <Textarea
                      value={formData.situation}
                      onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                      placeholder="Describe la situación..."
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Cuál fue la acción a tomar? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comparte que cambios o acciones se realizaron para obtener respuesta (orar, ayunar, asistir a la iglesia, etc.)
                    </p>
                    <Textarea
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="Describe las acciones tomadas..."
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">¿Cuál fue la respuesta ante la situación? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comparte cómo Dios obró ante la situación.
                    </p>
                    <Textarea
                      value={formData.response}
                      onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                      placeholder="Describe cómo Dios respondió..."
                      rows={5}
                      className="mt-2 resize-none"
                    />
                    
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm italic text-muted-foreground">
                        "Y ellos le han vencido por medio de la sangre del Cordero y de la palabra del testimonio de ellos."
                      </p>
                      <p className="text-sm font-medium text-primary mt-2">Apocalipsis 12:11</p>
                    </div>
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
                  disabled={!isStepValid()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Testimonio
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
