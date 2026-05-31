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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export interface BaptismRegistrationData {
  fullName: string;
  phone: string;
  email: string;
  receivedChrist: boolean | null;
  attendedMembership: boolean | null;
}

interface BaptismRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BaptismRegistrationData) => void;
}

const TOTAL_STEPS = 5;

export function BaptismRegistrationDialog({ open, onOpenChange, onSubmit }: BaptismRegistrationDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BaptismRegistrationData>({
    fullName: '',
    phone: '',
    email: '',
    receivedChrist: null,
    attendedMembership: null,
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
      fullName: '',
      phone: '',
      email: '',
      receivedChrist: null,
      attendedMembership: null,
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
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.phone.trim().length > 0;
      case 3:
        return true; // Email is optional
      case 4:
        return formData.receivedChrist !== null;
      case 5:
        return formData.attendedMembership !== null;
      default:
        return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl">Inscripción de Bautismos</DialogTitle>
          <DialogDescription className="text-center">
            Presenta tus datos e inscríbete a la charla informativa y de preparación para celebrar este paso de obediencia a Cristo.
            <br />
            <span className="text-xs mt-2 block">
              En cuanto envíes tu inscripción se te hará llegar información para conectarte a nuestra charla informativa y el link de ZOOM para conectarte.
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
                <Label className="text-base font-semibold">Nombre y Apellido *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Escribe tu nombre completo
                </p>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Tu nombre completo"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base font-semibold">Número de Teléfono *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Ingresa tu número de contacto
                </p>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Tu número de teléfono"
                  type="tel"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base font-semibold">Correo electrónico</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Opcional - Para enviarte información adicional
                </p>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  type="email"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base font-semibold">¿Recibiste a Cristo como tu Único Señor y Salvador? *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona una opción
                </p>
                <div className="space-y-3">
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.receivedChrist === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, receivedChrist: true })}
                  >
                    <Checkbox 
                      checked={formData.receivedChrist === true}
                      onCheckedChange={() => setFormData({ ...formData, receivedChrist: true })}
                    />
                    <Label className="cursor-pointer font-medium">Sí</Label>
                  </div>
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.receivedChrist === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, receivedChrist: false })}
                  >
                    <Checkbox 
                      checked={formData.receivedChrist === false}
                      onCheckedChange={() => setFormData({ ...formData, receivedChrist: false })}
                    />
                    <Label className="cursor-pointer font-medium">No</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <Label className="text-base font-semibold">¿Asististe al curso de Membrecía SOY NUEVOS HECHOS? *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona una opción
                </p>
                <div className="space-y-3">
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.attendedMembership === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, attendedMembership: true })}
                  >
                    <Checkbox 
                      checked={formData.attendedMembership === true}
                      onCheckedChange={() => setFormData({ ...formData, attendedMembership: true })}
                    />
                    <Label className="cursor-pointer font-medium">Sí</Label>
                  </div>
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.attendedMembership === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, attendedMembership: false })}
                  >
                    <Checkbox 
                      checked={formData.attendedMembership === false}
                      onCheckedChange={() => setFormData({ ...formData, attendedMembership: false })}
                    />
                    <Label className="cursor-pointer font-medium">No</Label>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm italic text-muted-foreground">
                    "Por tanto, vayan y hagan discípulos de todas las naciones, bautizándolos en el nombre del Padre y del Hijo y del Espíritu Santo, enseñándoles a obedecer todo lo que les he mandado a ustedes. Y les aseguro que estaré con ustedes siempre, hasta el fin del mundo."
                  </p>
                  <p className="text-sm font-medium text-primary mt-2">Mateo 28:19-20</p>
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
              Enviar Inscripción
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
