import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMembers } from '@/contexts/MembersContext';
import { saveClassReport } from '@/lib/classReports';

interface ReporteData {
  fechaClase: Date | undefined;
  liderNombre: string;
  diaReunion: string;
  miembrosAsistentes: string[];
  cantidadInvitados: string;
  nombresInvitados: string;
  huboDecisiones: boolean | null;
  decisionesInfo: string;
  testimonios: string;
  comentarios: string;
}

const TOTAL_STEPS = 6;
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export default function ReporteAbrirLosOjos() {
  const { members } = useMembers();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<ReporteData>({
    fechaClase: undefined,
    liderNombre: '',
    diaReunion: '',
    miembrosAsistentes: [],
    cantidadInvitados: '',
    nombresInvitados: '',
    huboDecisiones: null,
    decisionesInfo: '',
    testimonios: '',
    comentarios: '',
  });

  const update = <K extends keyof ReporteData>(key: K, value: ReporteData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const next = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    try {
      const attendeeNames = members
        .filter((m) => data.miembrosAsistentes.includes(m.id))
        .map((m) => `${m.firstName} ${m.lastName}`.trim());
      await saveClassReport({
        area: 'abrir-los-ojos',
        leccion: 'Abrir Los Ojos',
        reportDate: data.fechaClase ?? null,
        leaderName: data.liderNombre,
        attendeeIds: data.miembrosAsistentes,
        attendeeNames,
        extra: {
          diaReunion: data.diaReunion,
          cantidadInvitados: data.cantidadInvitados,
          nombresInvitados: data.nombresInvitados,
          huboDecisiones: data.huboDecisiones,
          decisionesInfo: data.decisionesInfo,
          testimonios: data.testimonios,
          comentarios: data.comentarios,
        },
      });
    } catch {
      toast.error('No se pudo guardar el reporte');
      return;
    }
    setSubmitted(true);
    toast.success('Reporte enviado con éxito');
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="flex flex-col items-center text-center gap-4 py-12">
              <div className="p-4 rounded-full bg-success/10">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold">¡Reporte enviado!</h2>
              <p className="text-muted-foreground">
                Gracias por enviar el reporte de Abrir Los Ojos.
              </p>
              <Button onClick={() => { setSubmitted(false); setStep(1); }}>
                Nuevo reporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Reporte Abrir Los Ojos</h1>
            <p className="text-muted-foreground text-sm">
              Paso {step} de {TOTAL_STEPS}
            </p>
          </div>
        </div>

        <Progress value={(step / TOTAL_STEPS) * 100} />

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Información general'}
              {step === 2 && 'Día de reunión'}
              {step === 3 && 'Asistencia de miembros'}
              {step === 4 && 'Invitados'}
              {step === 5 && 'Decisiones y testimonios'}
              {step === 6 && 'Comentarios finales'}
            </CardTitle>
            <CardDescription>Complete la información del reporte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Fecha de la clase</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !data.fechaClase && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.fechaClase
                          ? format(data.fechaClase, 'PPP', { locale: es })
                          : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={data.fechaClase}
                        onSelect={d => update('fechaClase', d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Nombre del líder</Label>
                  <Input
                    value={data.liderNombre}
                    onChange={e => update('liderNombre', e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label>Día de reunión</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIAS_SEMANA.map(d => (
                    <Button
                      key={d}
                      variant={data.diaReunion === d ? 'default' : 'outline'}
                      onClick={() => update('diaReunion', d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <Label>Miembros asistentes</Label>
                <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
                  {members.length === 0 && (
                    <p className="p-3 text-sm text-muted-foreground">No hay miembros registrados</p>
                  )}
                  {members.map(m => {
                    const nombre = `${m.firstName} ${m.lastName}`.trim();
                    return (
                      <label key={m.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
                        <Checkbox
                          checked={data.miembrosAsistentes.includes(m.id)}
                          onCheckedChange={c => {
                            if (c) update('miembrosAsistentes', [...data.miembrosAsistentes, m.id]);
                            else update('miembrosAsistentes', data.miembrosAsistentes.filter(x => x !== m.id));
                          }}
                        />
                        <span className="text-sm">{nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Cantidad de invitados</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.cantidadInvitados}
                    onChange={e => update('cantidadInvitados', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombres de invitados</Label>
                  <Textarea
                    value={data.nombresInvitados}
                    onChange={e => update('nombresInvitados', e.target.value)}
                    placeholder="Liste los nombres separados por coma"
                    rows={3}
                  />
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="space-y-2">
                  <Label>¿Hubo decisiones?</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={data.huboDecisiones === true ? 'default' : 'outline'}
                      onClick={() => update('huboDecisiones', true)}
                    >
                      Sí
                    </Button>
                    <Button
                      variant={data.huboDecisiones === false ? 'default' : 'outline'}
                      onClick={() => update('huboDecisiones', false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
                {data.huboDecisiones && (
                  <div className="space-y-2">
                    <Label>Información sobre las decisiones</Label>
                    <Textarea
                      value={data.decisionesInfo}
                      onChange={e => update('decisionesInfo', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Testimonios</Label>
                  <Textarea
                    value={data.testimonios}
                    onChange={e => update('testimonios', e.target.value)}
                    placeholder="Testimonios compartidos en la clase"
                    rows={4}
                  />
                </div>
              </>
            )}

            {step === 6 && (
              <div className="space-y-2">
                <Label>Comentarios finales</Label>
                <Textarea
                  value={data.comentarios}
                  onChange={e => update('comentarios', e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={5}
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prev} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              {step < TOTAL_STEPS ? (
                <Button onClick={next}>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  <Send className="w-4 h-4 mr-1" />
                  Enviar reporte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
