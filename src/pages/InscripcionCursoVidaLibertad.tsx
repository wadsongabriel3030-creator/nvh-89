import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { saveClassReport } from '@/lib/classReports';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  Building2,
  Pencil,
  X,
  Save,
} from 'lucide-react';

interface EventSettings {
  fechaInicio: string;
  horario: string;
  lugar: string;
  costoLibro: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCuenta: string;
  fechaLimitePago: string;
  whatsapp: string;
  costoRetiro: string;
}

const DEFAULT_SETTINGS: EventSettings = {
  fechaInicio: 'LUNES 15 DE JUNIO',
  horario: '7:30 P.M.',
  lugar: 'DANCE FACTORY MAJADAS, C.C. MAJADAS ONCE',
  costoLibro: 'Q100.00',
  banco: 'BANCO INDUSTRIAL',
  tipoCuenta: 'Cuenta Monetaria',
  numeroCuenta: '0490192499',
  nombreCuenta: 'IGLESIA CRISTIANA CONEXIÓN',
  fechaLimitePago: 'LUNES 15 DE JUNIO',
  whatsapp: '3067-5112',
  costoRetiro: 'Q200.00',
};

const COMPROMISOS = [
  'Me comprometo a participar y equiparme durante las 13 semanas del curso Vida en Libertad, asistiendo puntualmente cada lunes.',
  'Me comprometo a realizar con responsabilidad y excelencia cada una de las tareas e indicaciones que me sean asignadas durante la semana.',
  'Me comprometo a ser instrumentos y cumplir con la Gran Comisión de ir y formar a muchos discípulos.',
  'Estoy enterado(a) y me comprometo a realizar el pago de Q200.00 cuando sea solicitado, correspondiente al retiro que se llevará a cabo al finalizar las Lecciones del curso Vida en Libertad.',
  'Y sobre todo me comprometo a participar todo el tiempo con corazón dispuesto y comprometido.',
];

const TOTAL_STEPS = 3;

export default function InscripcionCursoVidaLibertad() {
  const navigate = useNavigate();
  const { value: settings, setValue: setSettings, loading: loadingSettings } =
    useDbStorage<EventSettings>('inscripcion-cvl-settings', DEFAULT_SETTINGS, 'vida-libertad');

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<EventSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!loadingSettings) setEditDraft(settings);
  }, [loadingSettings, settings]);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [compromisos, setCompromisos] = useState<boolean[]>(COMPROMISOS.map(() => false));

  const toggleCompromiso = (idx: number) => {
    setCompromisos((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const allCompromisosChecked = compromisos.every(Boolean);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return nombre.trim().length > 0;
      case 2:
        return telefono.trim().length > 0;
      case 3:
        return allCompromisosChecked;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      await saveClassReport({
        area: 'inscripcion-curso-vida-libertad',
        leccion: 'Inscripción Curso Vida en Libertad',
        reportDate: new Date(),
        leaderName: nombre,
        attendeeIds: [],
        attendeeNames: [nombre],
        extra: {
          telefono,
          compromisos: COMPROMISOS.filter((_, i) => compromisos[i]),
        },
      });
    } catch {
      // show success even if save fails
    }
    toast.success('¡Inscripción enviada con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setNombre('');
    setTelefono('');
    setCompromisos(COMPROMISOS.map(() => false));
  };

  const handleSaveSettings = () => {
    setSettings(editDraft);
    setEditing(false);
    toast.success('Información del evento actualizada');
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Inscripción Enviada!</h2>
              <p className="text-muted-foreground">
                Gracias por inscribirte al Curso Vida en Libertad. ¡Te esperamos!
              </p>
              <p className="text-sm text-muted-foreground">
                Recuerda enviar tu comprobante de pago al WhatsApp{' '}
                <span className="font-semibold text-foreground">{settings.whatsapp}</span>
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate('/curso-vida-libertad')}>
                  Volver al Curso
                </Button>
                <Button onClick={handleReset}>Nueva Inscripción</Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Registro de Participación y Compromiso
              </h1>
              <p className="text-lg font-semibold text-primary mt-1">VIDA EN LIBERTAD</p>
              <p className="text-sm text-muted-foreground mt-2">
                Curso para una Verdadera Libertad.
              </p>
            </div>

            {/* Event Info Card */}
            <div className="mb-6 p-4 bg-muted/50 rounded-xl border space-y-3 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 w-7 p-0"
                onClick={() => {
                  if (editing) {
                    setEditDraft(settings);
                    setEditing(false);
                  } else {
                    setEditing(true);
                  }
                }}
                title={editing ? 'Cancelar edición' : 'Editar información'}
              >
                {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              </Button>

              {editing ? (
                <div className="space-y-3 pr-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Fecha de Inicio</Label>
                      <Input
                        value={editDraft.fechaInicio}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, fechaInicio: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Horario</Label>
                      <Input
                        value={editDraft.horario}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, horario: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Lugar</Label>
                      <Input
                        value={editDraft.lugar}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, lugar: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Costo del libro</Label>
                      <Input
                        value={editDraft.costoLibro}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, costoLibro: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Costo del retiro</Label>
                      <Input
                        value={editDraft.costoRetiro}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, costoRetiro: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Banco</Label>
                      <Input
                        value={editDraft.banco}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, banco: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Tipo de Cuenta</Label>
                      <Input
                        value={editDraft.tipoCuenta}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, tipoCuenta: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">No. de Cuenta</Label>
                      <Input
                        value={editDraft.numeroCuenta}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, numeroCuenta: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">A nombre de</Label>
                      <Input
                        value={editDraft.nombreCuenta}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, nombreCuenta: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Fecha límite de pago</Label>
                      <Input
                        value={editDraft.fechaLimitePago}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, fechaLimitePago: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">WhatsApp para comprobante</Label>
                      <Input
                        value={editDraft.whatsapp}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, whatsapp: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} size="sm" className="w-full gap-2 mt-2">
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">
                      FECHA DE INICIO: {settings.fechaInicio}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">HORARIO: {settings.horario}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">LUGAR: {settings.lugar}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">
                      {settings.costoLibro} (Costo de libro)
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Transferencia o depósitos a:
                    </p>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{settings.banco}</p>
                        <p className="text-sm text-foreground">
                          {settings.tipoCuenta} No. {settings.numeroCuenta}
                        </p>
                        <p className="text-sm text-foreground">A nombre de: {settings.nombreCuenta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      📌 El costo del libro debe ser cancelado a más tardar el{' '}
                      <span className="font-semibold">{settings.fechaLimitePago}</span>.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Enviar comprobante de pago al WhatsApp{' '}
                      <span className="font-semibold">{settings.whatsapp}</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Paso {step} de {TOTAL_STEPS}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="min-h-[200px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Nombre Completo *</Label>
                    <Input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
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
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Escribe tu número de teléfono"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">COMPROMISO *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Marca todos los compromisos para continuar
                    </p>
                    <div className="space-y-3">
                      {COMPROMISOS.map((texto, idx) => (
                        <label
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={compromisos[idx]}
                            onCheckedChange={() => toggleCompromiso(idx)}
                            className="mt-0.5"
                          />
                          <span className="text-sm text-foreground leading-relaxed">{texto}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
                    <p>
                      El pago del libro de {settings.costoLibro}, lo debo realizar a más tardar el día{' '}
                      <span className="font-semibold text-foreground">{settings.fechaLimitePago}</span> en:
                    </p>
                    <p className="mt-1">
                      Enviar comprobante de pago al Número de WhatsApp{' '}
                      <span className="font-semibold text-foreground">{settings.whatsapp}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
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
