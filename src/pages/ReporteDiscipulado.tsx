import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { saveClassReport } from '@/lib/classReports';

const LECCIONES_DEFAULT = [
  'Lección de Arrepentimiento',
  'Disciplinas Espirituales',
  'Administración',
  'Familia Cristiana',
  'Freedom',
];

const LECCIONES_POR_CURSO: Record<string, { titulo: string; lecciones: string[] }> = {
  administracion: {
    titulo: 'Administración',
    lecciones: [
      'Lección 1 - Administración definida',
      'Lección 2 – Dinero y posesiones',
      'Lección 3 – Ganar dinero',
      'Lección 4 – Gastar sabiamente',
      'Lección 5 – Dar/diezmar',
      'Lección 6 – Dar generosamente/sacrificialmente',
      'Lección 7 – Codicia',
      'Lección 8 – Cuidar a otros',
      'Lección 9 – Dones espirituales',
      'Lección 10 – La vida como un administrador',
    ],
  },
  'la-familia': {
    titulo: 'La Familia',
    lecciones: [
      'Lección 1: El propósito de Dios para el matrimonio',
      'Lección 2: El cimiento del matrimonio',
      'Lección 3: Convenio del matrimonio',
      'Lección 4: Cómo funciona el matrimonio',
      'Lección 5: Pautas para los esposos',
      'Lección 6: Pautas para las esposas',
      'Lección 7: Criar hijos a manera de Dios',
      'Lección 8: Criar hijos sanos: Nutrir y entrenar',
      'Lección 9: Pautas para una disciplina justa',
    ],
  },
  'creencias-basicas': {
    titulo: 'Creencias Básicas',
    lecciones: [
      'Lección 1 – La Biblia',
      'Lección 2 – Dios Padre',
      'Lección 3 – Hijo: Jesús',
      'Lección 4 – Dios Espíritu Santo',
      'Lección 5 – Origen del hombre',
      'Lección 6 – Origen del hombre',
      'Lección 7 – Satanás y la tentación',
      'Lección 8 – La sangre de Jesús',
      'Lección 9 – La resurrección de Jesús',
      'Lección 10 – La gracia',
      'Lección 11 – El bautismo en agua',
      'Lección 12 – Cielo o infierno',
      'Lección 13 – El retorno de Jesús (Su segunda venida)',
    ],
  },
};

interface ReporteDiscipuladoData {
  leccionSeleccionada: string;
  fechaDiscipulado: Date | undefined;
  nombreDiscipulador: string;
  discipulosPresentes: string[];
}

const TOTAL_STEPS = 4;

export default function ReporteDiscipulado() {
  const [searchParams] = useSearchParams();
  const cursoParam = searchParams.get('curso') || '';
  const cursoConfig = LECCIONES_POR_CURSO[cursoParam];
  const lecciones = cursoConfig ? cursoConfig.lecciones : LECCIONES_DEFAULT;
  // Map course slugs to their IDs in the discipleship-courses-v1 storage
  const SLUG_TO_COURSE_ID: Record<string, string> = {
    administracion: '3',
    'la-familia': '4',
    'creencias-basicas': '5',
  };

  const [alumnos, setAlumnos] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!cursoParam) return;
    try {
      // Read enrolled students from localStorage (same store as NivelI)
      const raw = localStorage.getItem('discipleship-courses-v1');
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, { id: string; name: string }[]>;
        const courseId = SLUG_TO_COURSE_ID[cursoParam];
        const list = courseId ? saved[courseId] : undefined;
        if (Array.isArray(list)) {
          setAlumnos(list.map((s: any) => ({ id: String(s.id), name: String(s.name) })));
        }
      }
    } catch {}
  }, [cursoParam]);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<ReporteDiscipuladoData>({
    leccionSeleccionada: '',
    fechaDiscipulado: undefined,
    nombreDiscipulador: '',
    discipulosPresentes: [],
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

  const handleSubmit = async () => {
    try {
      const presentes = alumnos.filter((a) => formData.discipulosPresentes.includes(a.id));
      const nombresPresentes = presentes.map((a) => a.name);
      await saveClassReport({
        area: `discipulado:${cursoParam}`,
        leccion: formData.leccionSeleccionada,
        reportDate: formData.fechaDiscipulado ?? null,
        leaderName: formData.nombreDiscipulador,
        attendeeIds: presentes.map((a) => a.id),
        attendeeNames: nombresPresentes,
      });
    } catch {
      toast.error('No se pudo guardar el reporte');
      return;
    }
    toast.success('¡Reporte de Discipulado enviado con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      leccionSeleccionada: '',
      fechaDiscipulado: undefined,
      nombreDiscipulador: '',
      discipulosPresentes: [],
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fechaDiscipulado !== undefined;
      case 2:
        return formData.leccionSeleccionada.trim().length > 0;
      case 3:
        return formData.nombreDiscipulador.trim().length > 0;
      case 4:
        return formData.discipulosPresentes.length > 0;
      default:
        return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Reporte Enviado!</h2>
              <p className="text-muted-foreground">
                Gracias por enviar el reporte de Discipulado. La información ha sido registrada correctamente.
              </p>
              <Button onClick={handleReset} className="mt-4">
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">DISCIPULADO - Reporte</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {cursoConfig
                ? `Reporte semanal - ${cursoConfig.titulo}`
                : 'Reporte semanal para discipuladores'}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Paso {step} de {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="min-h-[250px] py-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Fecha de Discipulado *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seleccione la fecha del discipulado
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.fechaDiscipulado && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaDiscipulado ? format(formData.fechaDiscipulado, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fechaDiscipulado}
                        onSelect={(date) => setFormData({ ...formData, fechaDiscipulado: date })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Seleccione la Lección *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    ¿De cuál lección desea hacer el reporte?
                  </p>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {lecciones.map((leccion) => (
                      <div
                        key={leccion}
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                          formData.leccionSeleccionada === leccion
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => setFormData({ ...formData, leccionSeleccionada: leccion })}
                      >
                        <Checkbox
                          checked={formData.leccionSeleccionada === leccion}
                          onCheckedChange={() => setFormData({ ...formData, leccionSeleccionada: leccion })}
                        />
                        <Label className="cursor-pointer font-medium text-sm">{leccion}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Nombre del Discipulador *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Escriba el nombre completo del discipulador
                  </p>
                  <Input
                    value={formData.nombreDiscipulador}
                    onChange={(e) => setFormData({ ...formData, nombreDiscipulador: e.target.value })}
                    placeholder="Nombre completo"
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Discípulos presentes *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seleccione los discípulos que estuvieron presentes
                  </p>
                  {alumnos.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                      No hay alumnos registrados para este curso. Agregue alumnos desde la página de Discipulado.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {alumnos.map((alumno) => {
                        const checked = formData.discipulosPresentes.includes(alumno.id);
                        return (
                          <div
                            key={alumno.id}
                            className={cn(
                              "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              checked
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                discipulosPresentes: checked
                                  ? prev.discipulosPresentes.filter((id) => id !== alumno.id)
                                  : [...prev.discipulosPresentes, alumno.id],
                              }));
                            }}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  discipulosPresentes: checked
                                    ? prev.discipulosPresentes.filter((id) => id !== alumno.id)
                                    : [...prev.discipulosPresentes, alumno.id],
                                }));
                              }}
                            />
                            <Label className="cursor-pointer font-medium text-sm">{alumno.name}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {alumnos.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.discipulosPresentes.length} de {alumnos.length} seleccionados
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {step === TOTAL_STEPS ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Reporte
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
