import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, BookOpen, Heart, GraduationCap, Sparkles, Footprints, Award, Users, BookMarked, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathNode {
  id: string;
  number?: number;
  title: string;
  subtitle?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  children?: {
    label: string;
    sublabel?: string;
    href?: string;
    color: string;
    bgColor: string;
    subChildren?: { label: string; color: string; bgColor: string }[];
  }[];
}

const pathNodes: PathNode[] = [
  {
    id: 'nueva-vida',
    number: 1,
    title: 'NUEVA VIDA',
    color: 'text-blue-300',
    bgColor: 'bg-blue-950/60',
    borderColor: 'border-blue-500/40',
    icon: Sparkles,
    children: [
      {
        label: 'VIDA NUEVOS HECHOS',
        href: '/membresia',
        color: 'text-blue-200',
        bgColor: 'bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/30',
      },
      {
        label: 'PASOS FIRMES',
        href: '/primeros-pasos',
        color: 'text-cyan-200',
        bgColor: 'bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30',
      },
    ],
  },
  {
    id: 'vida-libertad',
    number: 2,
    title: 'VIDA EN LIBERTAD',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-500/40',
    icon: Heart,
    children: [
      {
        label: 'CURSO',
        sublabel: 'Vida en Libertad',
        href: '/curso-vida-libertad',
        color: 'text-emerald-200',
        bgColor: 'bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30',
      },
      {
        label: 'RETIRO',
        sublabel: 'Vida en Libertad',
        href: '/retiro-vida-libertad',
        color: 'text-teal-200',
        bgColor: 'bg-teal-500/20 border border-teal-400/40 hover:bg-teal-500/30',
      },
    ],
  },
  {
    id: 'escuela',
    number: 3,
    title: 'ESCUELA DE EQUIPAMIENTO',
    subtitle: '(NIVEL I)',
    color: 'text-amber-300',
    bgColor: 'bg-amber-950/60',
    borderColor: 'border-amber-500/40',
    icon: GraduationCap,
    children: [
      {
        label: 'ADMINISTRACIÓN',
        href: '/escuela-equipamiento',
        color: 'text-amber-200',
        bgColor: 'bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30',
        subChildren: [
          { label: 'CURSO La Administración', color: 'text-amber-100', bgColor: 'bg-amber-900/50 border border-amber-500/20' },
          { label: 'PRÁCTICA', color: 'text-amber-100', bgColor: 'bg-amber-900/50 border border-amber-500/20' },
        ],
      },
      {
        label: 'LA FAMILIA',
        href: '/escuela-equipamiento',
        color: 'text-orange-200',
        bgColor: 'bg-orange-500/20 border border-orange-400/40 hover:bg-orange-500/30',
        subChildren: [
          { label: 'CURSO La Familia', color: 'text-orange-100', bgColor: 'bg-orange-900/50 border border-orange-500/20' },
          { label: 'SEMINARIO FAMILIAR', color: 'text-orange-100', bgColor: 'bg-orange-900/50 border border-orange-500/20' },
        ],
      },
      {
        label: 'CREENCIAS BÁSICAS',
        href: '/escuela-equipamiento',
        color: 'text-rose-200',
        bgColor: 'bg-rose-500/20 border border-rose-400/40 hover:bg-rose-500/30',
        subChildren: [
          { label: 'CURSO Creencias Básicas de la Cristiandad', color: 'text-rose-100', bgColor: 'bg-rose-900/50 border border-rose-500/20' },
          { label: 'PRÁCTICA', color: 'text-rose-100', bgColor: 'bg-rose-900/50 border border-rose-500/20' },
        ],
      },
    ],
  },
];

export default function RutaDiscipulo() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <BookMarked className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ruta Escuela de Equipamiento</h1>
            <p className="text-muted-foreground mt-0.5">
              Camino de formación espiritual progresiva en Nuevos Hechos
            </p>
          </div>
        </div>

        {/* Journey Visual */}
        <div className="relative">
          {/* Background card */}
          <div className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 space-y-0">

            {/* INICIO */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/10 border border-red-500/40 shadow-lg shadow-red-500/10">
                  <Flame className="w-7 h-7 text-red-400" />
                </div>
                <span className="text-xl font-bold tracking-[0.3em] text-foreground/90 uppercase">
                  INICIO
                </span>
              </div>
              {/* Connector line */}
              <div className="mt-4 w-0.5 h-8 bg-gradient-to-b from-red-500/50 to-border/30" />
            </div>

            {/* Steps */}
            <div className="space-y-10">
              {pathNodes.map((node, idx) => {
                const Icon = node.icon;
                return (
                  <div key={node.id} className="flex flex-col items-center gap-6">
                    {/* Step row */}
                    <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-4">
                      {/* Step number + main box */}
                      <div className="flex items-center gap-3 lg:w-64 shrink-0">
                        {/* Number bubble */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/5 border border-border/60 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                          {node.number}
                        </div>

                        {/* Main step card */}
                        <div
                          className={cn(
                            'flex-1 rounded-xl px-4 py-3 border flex items-center gap-3 cursor-default',
                            node.bgColor,
                            node.borderColor
                          )}
                        >
                          <Icon className={cn('w-5 h-5 shrink-0', node.color)} />
                          <div>
                            <p className={cn('text-sm font-bold leading-tight', node.color)}>
                              {node.title}
                            </p>
                            {node.subtitle && (
                              <p className="text-xs text-muted-foreground">{node.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden lg:flex items-center pt-3">
                        <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                      </div>

                      {/* Children */}
                      {node.children && (
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 flex-1">
                          {node.children.map((child) => (
                            <div key={child.label} className="flex flex-col items-center gap-2">
                              {/* Child node */}
                              <button
                                onClick={() => child.href && navigate(child.href)}
                                className={cn(
                                  'rounded-lg px-4 py-2.5 text-center transition-all duration-200 cursor-pointer min-w-[120px]',
                                  child.bgColor
                                )}
                              >
                                <p className={cn('text-xs font-bold leading-tight', child.color)}>
                                  {child.label}
                                </p>
                                {child.sublabel && (
                                  <p className={cn('text-xs mt-0.5 opacity-80', child.color)}>
                                    {child.sublabel}
                                  </p>
                                )}
                              </button>

                              {/* Sub-children (level 3) */}
                              {child.subChildren && (
                                <div className="flex flex-col gap-1.5 items-center">
                                  {/* Connector */}
                                  <div className="w-0.5 h-3 bg-border/40" />
                                  <div className="flex flex-col gap-1.5">
                                    {child.subChildren.map((sub) => (
                                      <div
                                        key={sub.label}
                                        className={cn(
                                          'rounded-md px-3 py-1.5 text-center min-w-[120px]',
                                          sub.bgColor
                                        )}
                                      >
                                        <p className={cn('text-[10px] font-semibold leading-tight', sub.color)}>
                                          {sub.label}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Vertical connector to next step */}
                    {idx < pathNodes.length - 1 && (
                      <div className="w-0.5 h-6 bg-gradient-to-b from-border/50 to-border/20" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connector to CULMINACIÓN */}
            <div className="flex flex-col items-center mt-8">
              <div className="w-0.5 h-8 bg-gradient-to-b from-border/30 to-amber-500/50" />
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/10 border border-amber-500/40 shadow-lg shadow-amber-500/10">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <span className="text-xl font-bold tracking-[0.3em] text-foreground/90 uppercase">
                  CULMINACIÓN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick access cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Acceso Rápido por Etapa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Nueva Vida',
                description: 'Vida Nuevos Hechos + Pasos Firmes',
                icon: Sparkles,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
                links: [
                  { label: 'Vida Nuevos Hechos', href: '/membresia' },
                  { label: 'Pasos Firmes', href: '/primeros-pasos' },
                ],
              },
              {
                title: 'Vida en Libertad',
                description: 'Curso y Retiro Vida en Libertad',
                icon: Heart,
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
                links: [
                  { label: 'Curso Vida en Libertad', href: '/curso-vida-libertad' },
                  { label: 'Retiro Vida en Libertad', href: '/retiro-vida-libertad' },
                ],
              },
              {
                title: 'Escuela de Equipamiento',
                description: 'Nivel I – Administración, Familia y Creencias',
                icon: GraduationCap,
                color: 'text-amber-400',
                bgColor: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
                links: [
                  { label: 'Nivel I', href: '/escuela-equipamiento' },
                  { label: 'Cursos', href: '/cursos' },
                ],
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={cn(
                    'rounded-2xl border p-5 transition-all duration-200 bg-card/60 backdrop-blur-sm',
                    card.bgColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-card/80">
                      <Icon className={cn('w-5 h-5', card.color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {card.links.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-card/80 hover:bg-card border border-border/30 hover:border-border/60 text-muted-foreground hover:text-foreground transition-all duration-150 flex items-center gap-2"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Etapas', value: '3', icon: BookOpen, color: 'text-blue-400' },
            { label: 'Módulos', value: '7', icon: BookMarked, color: 'text-emerald-400' },
            { label: 'Culminación', value: '1', icon: Award, color: 'text-amber-400' },
            { label: 'Formación Integral', value: '✓', icon: Users, color: 'text-primary' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-border/40 bg-card/50 p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
