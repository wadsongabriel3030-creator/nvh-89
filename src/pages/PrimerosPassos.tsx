import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, FileText, BookOpen, Footprints, Sparkles, HeartHandshake, RefreshCw, Sun, Eye, CalendarCheck } from 'lucide-react';
import type { CursoPasosFirmes } from '@/components/pasos-firmes/PasosFirmesReporteDialog';

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
      </div>
    </MainLayout>
  );
}
