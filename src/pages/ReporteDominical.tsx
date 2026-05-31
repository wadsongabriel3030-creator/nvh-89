import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMembers } from '@/contexts/MembersContext';
import { toast } from 'sonner';

interface ReporteDominicalData {
  fecha: Date | undefined;
  liderId: string;
  horaInicio: string;
  horaFin: string;
  asistentes: string;
  visitantesPrimeraVez: string;
  regularesNoAsistieron: string[];
  servidores: string;
  testimonios: string;
}

const LIDERES_PREDEFINIDOS = [
  'Pastor Kevin Piche / Pastora Wendy de Piche',
  'Pastor Renato Arce / Pastora Deglyn de Arce',
  'Pablo García / Evelyn de García',
  'Javier García / Alejandra de García',
  'Carlos Iván López / Ana Beatriz de López',
];

const TOTAL_STEPS = 9;

export default function ReporteDominical() {
  const navigate = useNavigate();
  const { members } = useMembers();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ReporteDominicalData>({
    fecha: new Date(),
    liderId: '',
    horaInicio: '',
    horaFin: '',
    asistentes: '',
    visitantesPrimeraVez: '',
    regularesNoAsistieron: [],
    servidores: '',
    testimonios: '',
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast.success('¡Reporte dominical guardado con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      fecha: new Date(),
      liderId: '',
      horaInicio: '',
      horaFin: '',
      asistentes: '',
      visitantesPrimeraVez: '',
      regularesNoAsistieron: [],
      servidores: '',
      testimonios: '',
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!formData.fecha;
      case 2:
        return formData.liderId.trim().length > 0;
      case 3:
        return formData.horaInicio.trim().length > 0;
      case 4:
        return formData.horaFin.trim().length > 0;
      case 5:
        return formData.asistentes.trim().length > 0;
      case 6:
        return formData.visitantesPrimeraVez.trim().length > 0;
      case 7:
        return true;
      case 8:
        return formData.servidores.trim().length > 0;
      case 9:
        return true;
      default:
        return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Reporte guardado!</h2>
              <p className="text-muted-foreground">
                El reporte dominical fue registrado exitosamente.
              </p>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleReset}>
                  Nuevo Reporte
                </Button>
                <Button onClick={() => navigate('/members')}>Volver a Miembros</Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Reporte Dominical</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Registre la información de la reunión dominical
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Paso {step} de {TOTAL_STEPS}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="min-h-[200px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Fecha de Reunión Dominical *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-3',
                          !formData.fecha && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fecha ? (
                          format(formData.fecha, 'PPP', { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fecha}
                        onSelect={(d) => setFormData({ ...formData, fecha: d })}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Nombre de Líder Encargado *</Label>
                  <Select
                    value={formData.liderId}
                    onValueChange={(v) => setFormData({ ...formData, liderId: v })}
                  >
                    <SelectTrigger className="mt-3">
                      <SelectValue placeholder="Seleccione un líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIDERES_PREDEFINIDOS.map((nombre) => (
                        <SelectItem key={nombre} value={nombre}>
                          {nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    Hora real de inicio de la reunión *
                  </Label>
                  <Input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="mt-3"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    Hora real de finalización de la reunión dominical *
                  </Label>
                  <Input
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="mt-3"
                  />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    ¿Cuántas personas asistieron en total a la Reunión Dominical? *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ej: 120"
                    value={formData.asistentes}
                    onChange={(e) => setFormData({ ...formData, asistentes: e.target.value })}
                    className="mt-3"
                  />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    ¿Cuántas personas nos visitaron por primera vez? *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ej: 5"
                    value={formData.visitantesPrimeraVez}
                    onChange={(e) =>
                      setFormData({ ...formData, visitantesPrimeraVez: e.target.value })
                    }
                    className="mt-3"
                  />
                </div>
              )}

              {step === 7 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    ¿Qué asistentes habituales estuvieron ausentes?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Marque los miembros que no asistieron ({formData.regularesNoAsistieron.length} seleccionados)
                  </p>
                  <ScrollArea className="h-64 w-full rounded-md border mt-3">
                    <div className="p-3 space-y-2">
                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay miembros registrados
                        </p>
                      ) : (
                        members.map((m) => {
                          const checked = formData.regularesNoAsistieron.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  setFormData({
                                    ...formData,
                                    regularesNoAsistieron: v
                                      ? [...formData.regularesNoAsistieron, m.id]
                                      : formData.regularesNoAsistieron.filter((id) => id !== m.id),
                                  });
                                }}
                              />
                              <span className="text-sm text-foreground">
                                {m.firstName} {m.lastName}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    ¿Cuántos servidores o voluntarios estuvieron activos? *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ej: 15"
                    value={formData.servidores}
                    onChange={(e) => setFormData({ ...formData, servidores: e.target.value })}
                    className="mt-3"
                  />
                </div>
              )}

              {step === 9 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">
                    ¿Qué testimonios o evidencias de ministración ocurrieron?
                  </Label>
                  <Textarea
                    placeholder="Describa los testimonios o evidencias de ministración..."
                    value={formData.testimonios}
                    onChange={(e) => setFormData({ ...formData, testimonios: e.target.value })}
                    className="mt-3 min-h-[140px]"
                  />
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
                <Button onClick={handleNext} disabled={!isStepValid()} className="gap-2">
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Guardar Reporte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
