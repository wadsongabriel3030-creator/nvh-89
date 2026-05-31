import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, ChevronLeft, ChevronRight, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDbStorage } from '@/hooks/useDbStorage';
import { PLCGroup } from '@/types';
import { useMembers } from '@/contexts/MembersContext';
import { useTestimonies } from '@/contexts/TestimoniesContext';

interface ReportePLCData {
  fechaPLC: Date | undefined;
  liderNombre: string;
  diaReunion: string;
  miembrosAsistentesIds: string[];
  cantidadInvitados: string;
  nombresInvitados: string;
  huboConvertidos: boolean | null;
  convertidosInfo: string;
  huboReconciliados: boolean | null;
  reconciliadosInfo: string;
  huboIncorporados: boolean | null;
  incorporadosInfo: string;
  testimonioMilagros: string;
  ofrendaRecolectada: string;
  todosRecibieronAnuncios: boolean | null;
  comentarios: string;
}

const TOTAL_STEPS = 11;
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ReportePLC() {
  const { members } = useMembers();
  const { addTestimony } = useTestimonies();
  const { value: plcGroups } = useDbStorage<PLCGroup[]>('plc_groups_list', []);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Get PLC ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const plcId = urlParams.get('plc');

  // Get the current PLC group from real storage
  const currentPLC =
    (plcId ? plcGroups.find((plc) => plc.id === plcId) : undefined) ?? plcGroups[0];

  // Get members of the current PLC (members + leader, deduped via filter)
  const plcMembers = currentPLC
    ? members.filter(
        (m) =>
          currentPLC.members.includes(m.id) || m.id === currentPLC.leaderId
      )
    : [];

  // Auto-detect leader
  const detectarLider = () => {
    if (currentPLC) {
      const lider = members.find((m) => m.id === currentPLC.leaderId);
      return lider ? `${lider.firstName} ${lider.lastName}` : 'Líder no detectado';
    }
    return 'Líder no detectado';
  };

  const [formData, setFormData] = useState<ReportePLCData>({
    fechaPLC: undefined,
    liderNombre: detectarLider(),
    diaReunion: '',
    miembrosAsistentesIds: [],
    cantidadInvitados: '',
    nombresInvitados: '',
    huboConvertidos: null,
    convertidosInfo: '',
    huboReconciliados: null,
    reconciliadosInfo: '',
    huboIncorporados: null,
    incorporadosInfo: '',
    testimonioMilagros: '',
    ofrendaRecolectada: '',
    todosRecibieronAnuncios: null,
    comentarios: '',
  });

  // Update leader name once PLC group/members finish loading
  useEffect(() => {
    const detected = detectarLider();
    setFormData((prev) =>
      prev.liderNombre === detected ? prev : { ...prev, liderNombre: detected }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPLC?.id, members.length]);

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
    if (formData.testimonioMilagros.trim().length > 0) {
      const liderName = formData.liderNombre && formData.liderNombre !== 'Líder no detectado'
        ? formData.liderNombre
        : 'PLC';
      const fechaStr = formData.fechaPLC
        ? format(formData.fechaPLC, 'yyyy-MM-dd')
        : new Date().toISOString().split('T')[0];
      addTestimony({
        authorId: currentPLC?.leaderId ?? 'plc',
        authorName: liderName,
        title: `Testimonio PLC ${currentPLC?.name ?? ''}`.trim(),
        content: formData.testimonioMilagros.trim(),
        date: fechaStr,
        status: 'pending',
        visibility: 'internal',
      });
    }
    toast.success('¡Reporte PLC enviado con éxito!');
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      fechaPLC: undefined,
      liderNombre: detectarLider(),
      diaReunion: '',
      miembrosAsistentesIds: [],
      cantidadInvitados: '',
      nombresInvitados: '',
      huboConvertidos: null,
      convertidosInfo: '',
      huboReconciliados: null,
      reconciliadosInfo: '',
      huboIncorporados: null,
      incorporadosInfo: '',
      testimonioMilagros: '',
      ofrendaRecolectada: '',
      todosRecibieronAnuncios: null,
      comentarios: '',
    });
  };

  const toggleMemberAttendance = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      miembrosAsistentesIds: prev.miembrosAsistentesIds.includes(memberId)
        ? prev.miembrosAsistentesIds.filter(id => id !== memberId)
        : [...prev.miembrosAsistentesIds, memberId]
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fechaPLC !== undefined;
      case 2:
        return formData.diaReunion.trim().length > 0;
      case 3:
        return formData.miembrosAsistentesIds.length > 0;
      case 4:
        return true; // Optional
      case 5:
        return formData.huboConvertidos !== null;
      case 6:
        return formData.huboReconciliados !== null;
      case 7:
        return formData.huboIncorporados !== null;
      case 8:
        return true; // Testimony is optional
      case 9:
        return formData.ofrendaRecolectada.trim().length > 0;
      case 10:
        return formData.todosRecibieronAnuncios !== null;
      case 11:
        return true; // Comentarios is optional
      default:
        return false;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="max-w-lg mx-auto pt-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Reporte Enviado!</h2>
              <p className="text-muted-foreground">
                Gracias por enviar el reporte del PLC. La información ha sido registrada correctamente.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleReset}>
                  Nuevo Reporte
                </Button>
                <Button onClick={() => navigate('/')}>
                  Ir al inicio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }


  return (
    <MainLayout hideSidebar>
      <div className="max-w-lg mx-auto pt-2 px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Button>
      </div>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <FileText className="w-8 h-8 text-success" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reporte PLC</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Complete el reporte semanal del PLC con la información de la reunión.
            </p>
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Líder del PLC:</p>
              <p className="text-base font-semibold text-foreground">{formData.liderNombre}</p>
            </div>
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
                  <Label className="text-base font-semibold">Fecha del PLC *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seleccione la fecha de la reunión del PLC
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.fechaPLC && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaPLC ? format(formData.fechaPLC, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fechaPLC}
                        onSelect={(date) => setFormData({ ...formData, fechaPLC: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Día de la Reunión *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seleccione el día de la semana
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DIAS_SEMANA.map((dia) => (
                      <div
                        key={dia}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${formData.diaReunion === dia ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                        onClick={() => setFormData({ ...formData, diaReunion: dia })}
                      >
                        <Label className="cursor-pointer font-medium">{dia}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Quiénes de los miembros de Nuevos Hechos asistieron? *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seleccione los miembros que asistieron
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {plcMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.miembrosAsistentesIds.includes(member.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleMemberAttendance(member.id)}
                      >
                        <Label className="cursor-pointer font-medium text-center text-sm">
                          {member.firstName} {member.lastName}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {plcMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay miembros registrados en este PLC
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Cuántos invitados asistieron?</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Escriba el número de invitados y sus nombres
                  </p>
                  <Input
                    value={formData.cantidadInvitados}
                    onChange={(e) => setFormData({ ...formData, cantidadInvitados: e.target.value })}
                    placeholder="Número de invitados"
                    type="number"
                    className="mb-3"
                  />
                  <Textarea
                    value={formData.nombresInvitados}
                    onChange={(e) => setFormData({ ...formData, nombresInvitados: e.target.value })}
                    placeholder="Nombre y Apellido de cada invitado..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Hubo algún Convertido durante el PLC?</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seleccione una opción
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboConvertidos === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboConvertidos: true })}
                    >
                      <Checkbox
                        checked={formData.huboConvertidos === true}
                        onCheckedChange={() => setFormData({ ...formData, huboConvertidos: true })}
                      />
                      <Label className="cursor-pointer font-medium">Sí</Label>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboConvertidos === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboConvertidos: false })}
                    >
                      <Checkbox
                        checked={formData.huboConvertidos === false}
                        onCheckedChange={() => setFormData({ ...formData, huboConvertidos: false })}
                      />
                      <Label className="cursor-pointer font-medium">No</Label>
                    </div>
                  </div>
                  {formData.huboConvertidos === true && (
                    <div className="mt-4">
                      <Textarea
                        value={formData.convertidosInfo}
                        onChange={(e) => setFormData({ ...formData, convertidosInfo: e.target.value })}
                        placeholder="Nombre, Apellido y Número de cada persona"
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Hubo algún Reconciliado durante el PLC?</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seleccione una opción
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboReconciliados === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboReconciliados: true })}
                    >
                      <Checkbox
                        checked={formData.huboReconciliados === true}
                        onCheckedChange={() => setFormData({ ...formData, huboReconciliados: true })}
                      />
                      <Label className="cursor-pointer font-medium">Sí</Label>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboReconciliados === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboReconciliados: false })}
                    >
                      <Checkbox
                        checked={formData.huboReconciliados === false}
                        onCheckedChange={() => setFormData({ ...formData, huboReconciliados: false })}
                      />
                      <Label className="cursor-pointer font-medium">No</Label>
                    </div>
                  </div>
                  {formData.huboReconciliados === true && (
                    <div className="mt-4">
                      <Textarea
                        value={formData.reconciliadosInfo}
                        onChange={(e) => setFormData({ ...formData, reconciliadosInfo: e.target.value })}
                        placeholder="Nombre, Apellido y Número de cada persona"
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Hubo alguien que se incorporó al PLC?</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seleccione una opción
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboIncorporados === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboIncorporados: true })}
                    >
                      <Checkbox
                        checked={formData.huboIncorporados === true}
                        onCheckedChange={() => setFormData({ ...formData, huboIncorporados: true })}
                      />
                      <Label className="cursor-pointer font-medium">Sí</Label>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.huboIncorporados === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, huboIncorporados: false })}
                    >
                      <Checkbox
                        checked={formData.huboIncorporados === false}
                        onCheckedChange={() => setFormData({ ...formData, huboIncorporados: false })}
                      />
                      <Label className="cursor-pointer font-medium">No</Label>
                    </div>
                  </div>
                  {formData.huboIncorporados === true && (
                    <div className="mt-4">
                      <Textarea
                        value={formData.incorporadosInfo}
                        onChange={(e) => setFormData({ ...formData, incorporadosInfo: e.target.value })}
                        placeholder="Nombre, Apellido y Número de cada persona"
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Testimonio de milagros ocurrido durante la semana</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comparta los testimonios de la semana (opcional)
                  </p>
                  <Textarea
                    value={formData.testimonioMilagros}
                    onChange={(e) => setFormData({ ...formData, testimonioMilagros: e.target.value })}
                    placeholder="Describa los testimonios y milagros..."
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Ofrenda presentada *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ingrese el monto total de la ofrenda
                  </p>
                  <Input
                    value={formData.ofrendaRecolectada}
                    onChange={(e) => setFormData({ ...formData, ofrendaRecolectada: e.target.value })}
                    placeholder="Monto de la ofrenda"
                    type="number"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">¿Todos recibieron los anuncios? *</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seleccione una opción
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.todosRecibieronAnuncios === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, todosRecibieronAnuncios: true })}
                    >
                      <Checkbox
                        checked={formData.todosRecibieronAnuncios === true}
                        onCheckedChange={() => setFormData({ ...formData, todosRecibieronAnuncios: true })}
                      />
                      <Label className="cursor-pointer font-medium">Sí</Label>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.todosRecibieronAnuncios === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setFormData({ ...formData, todosRecibieronAnuncios: false })}
                    >
                      <Checkbox
                        checked={formData.todosRecibieronAnuncios === false}
                        onCheckedChange={() => setFormData({ ...formData, todosRecibieronAnuncios: false })}
                      />
                      <Label className="cursor-pointer font-medium">No</Label>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm italic text-muted-foreground">
                      "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos."
                    </p>
                   <p className="text-sm font-medium text-primary mt-2">Mateo 18:20</p>
                  </div>
                </div>
              </div>
            )}

            {step === 11 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-base font-semibold">Comentarios</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Agregue cualquier comentario adicional (opcional)
                  </p>
                  <Textarea
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                    placeholder="Escriba sus comentarios aquí..."
                    className="min-h-[150px]"
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
                disabled={!isStepValid()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Reporte
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
