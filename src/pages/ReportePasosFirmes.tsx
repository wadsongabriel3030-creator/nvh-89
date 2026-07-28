import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMembers } from '@/contexts/MembersContext';
import { toast } from 'sonner';
import type { CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';
import { saveClassReport, fetchClassReports, type ClassReportRow } from '@/lib/classReports';

const CURSOS: CursoPasosFirmes[] = [
  {
    id: 'arrepentimiento',
    nombre: 'Lección 1 – Arrepentimiento',
    color: 'text-primary',
    lecciones: ['Arrepentimiento de Obras Muertas'],
  },
  {
    id: 'cambio-de-reino',
    nombre: 'Lección 2 – Cambio de Reino',
    color: 'text-orange-500',
    lecciones: ['Cambio de Reino'],
  },
  {
    id: 'encuentro-diario',
    nombre: 'Lección 3 – Encuentro Diario',
    color: 'text-accent',
    lecciones: ['¿Cómo Hacer Tú Encuentro Diario?', 'Plan Bíblico Nuevos Hechos'],
  },
  {
    id: 'disciplinas-espirituales',
    nombre: 'Lección 4 – Disciplinas Espirituales',
    color: 'text-success',
    lecciones: [
      'Semana 0 – Video de Introducción',
      'Semana 1 – Oración y Ayuno',
      'Semana 2 – Leer, Predicar y Practicar',
      'Semana 3 – Adoración',
      'Semana 4 – Mayordomía',
      'Semana 5 – Testificar',
      'Semana 6 – Sencillez',
      'Semana 7 – Servicio',
    ],
  },
  {
    id: 'dia-antes',
    nombre: 'Lección 5 – Día Antes',
    color: 'text-violet-500',
    lecciones: ['Día Antes'],
  },
  {
    id: 'curso-vida-libertad',
    nombre: 'Curso Vida en Libertad',
    color: 'text-primary',
    lecciones: [
      'Semana 1 – Notas del Video: El Árbol de La Vida',
      'Semana 2 – El Árbol del Conocimiento del Bien y del Mal',
      'Semana 3 – El Árbol de La Vida',
      'Semana 4 – Orden Espiritual',
      'Semana 5 – Notas del Video: La Abundancia del Corazón',
      'Semana 6 – Una Vida de Entrega',
      'Semana 7 – El Perdón',
      'Semana 8 – El Poder de las Palabras',
      'Semana 9 – La Palabra Viva',
      'Semana 10 – Notas del Video: Vasijas de Honra',
      'Semana 11 – Vasijas de Honra',
      'Semana 12 – Adoración',
    ],
  },
];

export default function ReportePasosFirmes() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const { members } = useMembers();
  const curso = useMemo(() => CURSOS.find(c => c.id === cursoId) ?? null, [cursoId]);
  const backPath = cursoId === 'curso-vida-libertad' ? '/curso-vida-libertad' : '/primeros-pasos';

  const [submitted, setSubmitted] = useState(false);
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [quienDio, setQuienDio] = useState('');
  const [leccion, setLeccion] = useState('');
  const [asistentes, setAsistentes] = useState<string[]>([]);
  const [invitados, setInvitados] = useState('');
  const [decisiones, setDecisiones] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Fetch existing reports for this curso to know which members already received each lesson
  const [existingReports, setExistingReports] = useState<ClassReportRow[]>([]);
  useEffect(() => {
    if (!curso) return;
    let active = true;
    (async () => {
      const all = await fetchClassReports();
      if (!active) return;
      setExistingReports(all.filter(r => r.area === curso.id));
    })();
    return () => { active = false; };
  }, [curso]);

  // Members who already attended the selected lesson
  const attendedMemberIds = useMemo(() => {
    if (!leccion) return new Set<string>();
    const ids = new Set<string>();
    for (const report of existingReports) {
      if (report.leccion === leccion && report.attendee_ids) {
        for (const id of report.attendee_ids) ids.add(id);
      }
    }
    return ids;
  }, [leccion, existingReports]);

  // Only show members who haven't received the selected lesson yet
  const availableMembers = useMemo(() => {
    if (!leccion) return members;
    return members.filter(m => !attendedMemberIds.has(m.id));
  }, [members, leccion, attendedMemberIds]);

  const reset = () => {
    setFecha(new Date());
    setQuienDio('');
    setLeccion('');
    setAsistentes([]);
    setInvitados('');
    setDecisiones('');
    setObservaciones('');
    setSubmitted(false);
  };

  const toggleMember = (id: string) => {
    setAsistentes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!fecha || !quienDio || !leccion) {
      toast.error('Complete fecha, quien dio la clase y lección');
      return;
    }
    try {
      const attendeeNames = members
        .filter((m) => asistentes.includes(m.id))
        .map((m) => `${m.firstName} ${m.lastName}`.trim());
      await saveClassReport({
        area: curso!.id,
        leccion,
        reportDate: fecha,
        leaderName: quienDio,
        attendeeIds: asistentes,
        attendeeNames,
        extra: { invitados, decisiones, observaciones },
      });
    } catch {
      toast.error('No se pudo guardar el reporte');
      return;
    }
    toast.success(`Reporte de "${curso?.nombre}" enviado con éxito`);
    setSubmitted(true);
  };

  if (!curso) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">Curso no encontrado</h2>
            <Button onClick={() => navigate(backPath)}>Volver</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                Gracias por enviar el reporte de {curso.nombre}. La información ha sido registrada correctamente.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate(backPath)}>Volver</Button>
                <Button onClick={reset}>Nuevo Reporte</Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(backPath)}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reporte – {curso.nombre}</h1>
            <p className="text-sm text-muted-foreground mt-2">Complete la información de la clase</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha de la clase *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !fecha && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fecha} onSelect={setFecha} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>¿Quién dio la clase? *</Label>
              <Input value={quienDio} onChange={(e) => setQuienDio(e.target.value)} placeholder="Nombre del instructor" />
            </div>

            <div className="space-y-2">
              <Label>Lección impartida *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {curso.lecciones.map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={leccion === l ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setLeccion(l); setAsistentes([]); }}
                    className="justify-start text-left h-auto py-2 whitespace-normal"
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Miembros asistentes ({asistentes.length})</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
                {!leccion && (
                  <p className="p-3 text-sm text-muted-foreground">Seleccione una lección para ver los miembros disponibles</p>
                )}
                {leccion && availableMembers.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">Todos los miembros ya recibieron esta lección</p>
                )}
                {leccion && availableMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={asistentes.includes(m.id)} onCheckedChange={() => toggleMember(m.id)} />
                    <span className="text-sm">{m.firstName} {m.lastName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Decisiones / Testimonios</Label>
              <Textarea value={decisiones} onChange={(e) => setDecisiones(e.target.value)} placeholder="Decisiones tomadas o testimonios compartidos" rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Comentarios adicionales" rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate(backPath)}>Cancelar</Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Send className="w-4 h-4" />
                Enviar reporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
