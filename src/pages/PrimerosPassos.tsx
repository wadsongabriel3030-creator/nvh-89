import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, FileText, BookOpen, Footprints, Sparkles, HeartHandshake, RefreshCw, Sun, Eye, CalendarCheck, ClipboardList, Calendar, User, CheckCircle, Phone, MessageSquare, Users, Heart } from 'lucide-react';
import type { CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';
import { fetchClassReports, type ClassReportRow } from '@/lib/classReports';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
const CURSOS: (CursoPasosFirmes & { icon: typeof BookOpen; descripcion: string; totalLabel: string })[] = [
  {
    id: 'arrepentimiento',
    nombre: 'Lección 1 – Arrepentimiento',
    descripcion: 'Arrepentimiento de Obras Muertas',
    totalLabel: '1 LECCIÓN',
    color: 'text-primary',
    icon: HeartHandshake,
    lecciones: ['Arrepentimiento de Obras Muertas'],
  },
  {
    id: 'cambio-de-reino',
    nombre: 'Lección 2 – Cambio de Reino',
    descripcion: 'Enseñanza sobre el Cambio de Reino',
    totalLabel: '1 LECCIÓN',
    color: 'text-orange-500',
    icon: RefreshCw,
    lecciones: ['Cambio de Reino'],
  },
  {
    id: 'encuentro-diario',
    nombre: 'Lección 3 – Encuentro Diario',
    descripcion: 'Enseñanza de cómo hacer tu Encuentro Diario y Plan Bíblico Nuevos Hechos',
    totalLabel: '2 LECCIONES',
    color: 'text-accent',
    icon: Sun,
    lecciones: [
      '¿Cómo Hacer Tú Encuentro Diario?',
      'Plan Bíblico Nuevos Hechos',
    ],
  },
  {
    id: 'disciplinas-espirituales',
    nombre: 'Lección 4 – Disciplinas Espirituales',
    descripcion: '8 semanas sobre las disciplinas que sostienen la vida cristiana',
    totalLabel: '8 SEMANAS',
    color: 'text-success',
    icon: BookOpen,
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
    descripcion: 'Preparación para el siguiente paso en la vida cristiana',
    totalLabel: '1 LECCIÓN',
    color: 'text-violet-500',
    icon: CalendarCheck,
    lecciones: ['Día Antes'],
  },
  {
    id: 'abrir-los-ojos',
    nombre: 'Lección 6 – Abrir los Ojos',
    descripcion: 'Abrir los ojos a la visión de Dios',
    totalLabel: '1 LECCIÓN',
    color: 'text-sky-500',
    icon: Eye,
    lecciones: ['Abrir los Ojos'],
  },
];

export default function PrimerosPassos() {
  const navigate = useNavigate();
  const abrirReporte = (curso: CursoPasosFirmes) => {
    navigate(`/reporte-pasos-firmes/${curso.id}`);
  };

  const [allReports, setAllReports] = useState<ClassReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingReports(true);
      const reports = await fetchClassReports();
      if (!active) return;
      
      const validAreas = [
        'inscripcion-primeros-pasos',
        ...CURSOS.map(c => c.id)
      ];

      const filtered = reports.filter(r => validAreas.includes(r.area));
      
      filtered.sort((a, b) => {
        const dateA = a.report_date || '';
        const dateB = b.report_date || '';
        return dateB.localeCompare(dateA);
      });
      setAllReports(filtered);
      setLoadingReports(false);
    })();
    return () => { active = false; };
  }, []);

  const getReportTypeBadge = (area: string) => {
    if (area === 'inscripcion-primeros-pasos') {
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
          <ClipboardList className="w-3 h-3 mr-1" />
          Inscripción
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
        <FileText className="w-3 h-3 mr-1" />
        Reporte de Clase
      </Badge>
    );
  };

  const renderReportCard = (report: ClassReportRow) => {
    const extra = (report.extra || {}) as Record<string, unknown>;
    const reportDate = report.report_date
      ? format(new Date(report.report_date + 'T12:00:00'), 'PPP', { locale: es })
      : 'Sin fecha';

    if (report.area === 'inscripcion-primeros-pasos') {
      return (
        <Card key={report.id} className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {getReportTypeBadge(report.area)}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {reportDate}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nombre Completo</p>
                  <p className="text-sm font-medium text-foreground">{report.leader_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <Heart className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Compromisos</p>
                  <ul className="text-sm text-foreground space-y-0.5">
                    <li className="flex items-center gap-1.5">
                      {extra.acepto ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Aceptó dar el primer paso</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {extra.conectarme ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>A conectarse o asistir puntualmente</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {extra.practica ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span>Poner en práctica lo aprendido</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Reporte de clase (pasos firmes)
    return (
      <Card key={report.id} className="border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {getReportTypeBadge(report.area)}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {reportDate}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Impartido por</p>
                <p className="text-sm font-medium text-foreground">{report.leader_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Lección</p>
                <p className="text-sm font-medium text-foreground">{report.leccion || '—'}</p>
              </div>
            </div>
            {report.attendee_names && report.attendee_names.length > 0 && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Asistentes ({report.attendee_names.length})</p>
                  <p className="text-sm text-foreground">{report.attendee_names.join(', ')}</p>
                </div>
              </div>
            )}
            {extra.invitados && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Invitados</p>
                  <p className="text-sm text-foreground">{extra.invitados as string}</p>
                </div>
              </div>
            )}
            {extra.decisiones && (
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Decisiones / Testimonios</p>
                  <p className="text-sm text-foreground">{extra.decisiones as string}</p>
                </div>
              </div>
            )}
            {extra.observaciones && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm text-foreground">{extra.observaciones as string}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Footprints className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pasos Firmes</h1>
              <p className="text-sm text-muted-foreground">
                Primer paso para crecer espiritualmente en Nuevos Hechos
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/inscripcion-primeros-pasos')} className="gap-2">
            <UserPlus className="w-4 h-4" />
            INSCRIPCIÓN
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURSOS.map((curso, idx) => {
            const Icon = curso.icon;
            return (
              <Card
                key={curso.id}
                className="hover:shadow-soft transition-all duration-300 animate-fade-in flex flex-col"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg bg-muted ${curso.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {curso.totalLabel}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-3">{curso.nombre}</CardTitle>
                  <CardDescription>{curso.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Lecciones
                    </p>
                    <ul className="space-y-1">
                      {curso.lecciones.slice(0, 4).map((l) => (
                        <li key={l} className="text-sm text-foreground flex gap-2">
                          <span className={`${curso.color} shrink-0`}>•</span>
                          <span className="line-clamp-1">{l}</span>
                        </li>
                      ))}
                      {curso.lecciones.length > 4 && (
                        <li className="text-xs text-muted-foreground pl-3">
                          +{curso.lecciones.length - 4} más
                        </li>
                      )}
                    </ul>
                  </div>
                  <Button
                    onClick={() => abrirReporte(curso)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Reporte
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Reportes</h2>
              <p className="text-sm text-muted-foreground">Inscripciones y Reportes de Clase</p>
            </div>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : allReports.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay reportes registrados aún</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Los reportes aparecerán aquí cuando se envíen inscripciones o reportes de clase.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allReports.map((report) => renderReportCard(report))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
