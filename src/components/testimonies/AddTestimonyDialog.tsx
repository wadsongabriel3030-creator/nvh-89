import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface TestimonyFormData {
  authorName: string;
  situation: string;
  action: string;
  response: string;
}

interface AddTestimonyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TestimonyFormData) => void;
}

const TOTAL_STEPS = 4;

export function AddTestimonyDialog({ open, onOpenChange, onSubmit }: AddTestimonyDialogProps) {
  const [step, setStep] = useState(1);
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
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      authorName: '',
      situation: '',
      action: '',
      response: '',
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset();
    }
    onOpenChange(isOpen);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl">TESTIMONIOS</DialogTitle>
          <DialogDescription className="text-center">
            Comparte lo que has visto que Dios ha hecho, en ti o en otras personas.
            <br />
            <span className="text-xs mt-2 block">
              Este formulario es una guía para ayudar a expresar cómo el Señor ha intervenido en medio de situaciones.
            </span>
            <span className="text-xs text-primary font-medium mt-2 block">
              ¡Recuerda! ¡Cada vida se convierte en la Historia de Dios!
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Paso {step} de {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="py-6 min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base font-semibold">Nombre</Label>
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
                <Label className="text-base font-semibold">¿Cuál era la situación?</Label>
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
                <Label className="text-base font-semibold">¿Qué acción se tomó?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Comparte las acciones que se realizaron para obtener las respuestas
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
                <Label className="text-base font-semibold">¿Cuál fue el resultado?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Comparte cómo Dios obró en esa situación.
                </p>
                <Textarea
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  placeholder="Describe cómo Dios respondió..."
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
              Seguinte
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Testemunho
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
