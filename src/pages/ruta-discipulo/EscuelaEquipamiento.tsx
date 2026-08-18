import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  ClipboardList,
  Calendar,
  BookOpenCheck,
  BookMarked,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const levels = [
  {
    id: 'nivel-i',
    title: 'Nivel I',
    description: 'Administración, La Familia y Creencias Básicas de la Cristiandad',
    href: '/escuela-equipamiento/nivel-i',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
    iconBg: 'bg-purple-500/10',
    modules: ['Administración', 'La Familia', 'Creencias Básicas'],
    available: true,
  },
];

const quickLinks = [
  { label: 'Cursos', href: '/cursos', icon: GraduationCap, description: 'Catálogo de cursos disponibles' },
  { label: 'Listado de Maestros', href: '/listado-lideres', icon: Users, description: 'Líderes y maestros activos' },
  { label: 'Reuniones de Mentores', href: '/reuniones-discipuladores', icon: Calendar, description: 'Agenda de reuniones' },
  { label: 'Guía de Mentor', href: '/guia-reunion-discipulado', icon: BookOpenCheck, description: 'Material de apoyo' },
  { label: 'Proceso de Discipular', href: '/proceso-discipular', icon: BookMarked, description: 'Pasos del proceso' },
  { label: 'Reporte Discipulado', href: '/reporte-discipulado', icon: ClipboardList, description: 'Ver reportes generados' },
];

export default function EscuelaEquipamiento() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
            <GraduationCap className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Escuela de Equipamiento</h1>
            <p className="text-muted-foreground mt-0.5">
              Formación y equipamiento integral para los discípulos de Nuevos Hechos
            </p>
          </div>
        </div>

        {/* Levels */}
        <div>
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Niveles disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => navigate(level.href)}
                className={cn(
                  'border rounded-2xl p-6 text-left transition-all duration-200 group w-full',
                  level.bgColor
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('p-2 rounded-xl', level.iconBg)}>
                    <BookOpen className={cn('w-5 h-5', level.color)} />
                  </div>
                  <ChevronRight className={cn(
                    'w-5 h-5 transition-transform duration-200 group-hover:translate-x-1',
                    level.color
                  )} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{level.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Módulos
                  </p>
                  {level.modules.map((mod) => (
                    <div key={mod} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', level.color.replace('text-', 'bg-'))} />
                      {mod}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Recursos y Herramientas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/60 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200 text-left group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-purple-300 transition-colors truncate">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-purple-400 shrink-0 ml-auto transition-all duration-200 group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-purple-500/10 shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Escuela de Equipamiento</p>
            <p className="text-sm text-muted-foreground mt-1">
              La Escuela de Equipamiento está diseñada para formar discípulos integrales. Cada nivel
              contiene módulos progresivos que cubren las áreas esenciales de la vida cristiana y el
              ministerio en Nuevos Hechos.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
