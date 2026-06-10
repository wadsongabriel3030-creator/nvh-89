import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { usePermissions, canAccessPath } from '@/hooks/usePermissions';

import {
  LayoutDashboard,
  Users,
  Tags,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  HandHeart,
  BookOpen,
  Sparkles,
  Heart,
  Droplets,
  BookHeart,
  Coins,
  MessageSquareQuote,
  Menu,
  X,
  UserPlus,
  BookOpenCheck,
  Clock,
  Church,
  Upload,
  FileText,
  MessageCircle,
  BookMarked,
  Megaphone,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavSubItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: number;
  children?: NavSubItem[];
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Resumen administrativo', href: '/' },
  { icon: Users, label: 'Miembros', href: '/members' },
  { icon: UserPlus, label: 'Invitados', href: '/guests' },
  { icon: Tags, label: 'Etiquetas', href: '/tags' },
  { icon: Calendar, label: 'Eventos', href: '/events' },
  { icon: Calendar, label: 'Calendario 2026', href: '/calendar-2026' },
];

const secondaryNavItems: NavItem[] = [
  {
    icon: Church,
    label: 'Reunión Dominical',
    children: [
      { icon: Upload, label: 'Recursos', href: '/reunion-dominical/recursos' },
      { icon: FileText, label: 'Programa', href: '/reunion-dominical/programa' },
      { icon: MessageCircle, label: 'Frases Institucionales', href: '/reunion-dominical/frases' },
      { icon: BookMarked, label: 'Versículos', href: '/reunion-dominical/versiculos' },
      { icon: Megaphone, label: 'Anuncios', href: '/reunion-dominical/anuncios' },
    ]
  },
  {
    icon: BookHeart,
    label: 'Guía de Oración',
    children: [
      { icon: BookOpenCheck, label: 'Secreto de Daniel', href: '/secreto-de-daniel' },
      { icon: Clock, label: 'Oración 24/7', href: '/oracion-247' },
      { icon: Heart, label: 'Cuarto de Guerra', href: '/cuarto-de-guerra' },
    ]
  },
  { icon: Coins, label: 'Diezmos', href: '/tithes' },
  { icon: MessageSquareQuote, label: 'Testimonios', href: '/testimonies' },
  { icon: HandHeart, label: 'PLCs', href: '/plc' },
  {
    icon: Sparkles,
    label: 'Nueva Vida',
    children: [
      { icon: Sparkles, label: 'Vida Nuevos Hechos', href: '/membresia' },
      { icon: Sparkles, label: 'Pasos Firmes', href: '/primeros-pasos' },
      { icon: Eye, label: 'Abrir Los Ojos', href: '/abrir-los-ojos' },
    ]
  },
  {
    icon: Heart,
    label: 'Vida en Libertad',
    children: [
      { icon: BookOpen, label: 'Curso Vida en Libertad', href: '/curso-vida-libertad' },
      { icon: Heart, label: 'Retiro Vida en Libertad', href: '/retiro-vida-libertad' },
    ]
  },
  { icon: Heart, label: 'Escuela de Equipamiento', href: '/creencias-basicas' },
  { icon: Droplets, label: 'Bautismos', href: '/batismos' },
  {
    icon: BookOpen,
    label: 'Escuela de Equipamiento',
    children: [
      { icon: BookOpen, label: 'Nivel I', href: '/discipleship' },
      { icon: GraduationCap, label: 'Cursos', href: '/cursos' },
      { icon: Users, label: 'Listado de Maestros', href: '/listado-lideres' },
      { icon: Calendar, label: 'Reuniones de mentores', href: '/reuniones-discipuladores' },
      { icon: BookOpenCheck, label: 'Guía de Mentor', href: '/guia-reunion-discipulado' },
      { icon: BookOpen, label: 'Proceso de Discipular', href: '/proceso-discipular' },
    ]
  },
  { icon: BarChart3, label: 'Informes', href: '/reports' },
];

export function Sidebar() {
  const { isOpen, isMobile, toggle, close } = useSidebarContext();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand if current route matches a child
    const expanded: string[] = [];
    secondaryNavItems.forEach(item => {
      if (item.children?.some(child => location.pathname === child.href)) {
        expanded.push(item.label);
      }
    });
    return expanded;
  });

  // Preserve sidebar scroll position across route changes (Sidebar remounts per page)
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem('sidebarScrollTop');
    if (saved) el.scrollTop = parseInt(saved, 10) || 0;
    const onScroll = () => {
      sessionStorage.setItem('sidebarScrollTop', String(el.scrollTop));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => {
    if (isMobile) {
      close();
    }
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    // Expandable item with children
    if (item.children) {
      const isExpanded = expandedItems.includes(item.label);
      const isChildActive = item.children.some(child => location.pathname === child.href);
      const Icon = item.icon;

      return (
        <div>
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left',
              isChildActive
                ? 'bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-[10px]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent ml-0 pl-[10px]'
            )}
          >
            <Icon
              className={cn(
                'w-[18px] h-[18px] shrink-0 transition-colors duration-200',
                isChildActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )}
              strokeWidth={isChildActive ? 2 : 1.5}
            />
            <span className={cn(
              'text-sm transition-colors duration-200 flex-1',
              isChildActive ? 'font-medium text-primary' : 'font-normal'
            )}>
              {item.label}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )} />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-2">
              {item.children.map(child => {
                const isActive = location.pathname === child.href;
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={handleNavClick}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <ChildIcon className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} strokeWidth={isActive ? 2 : 1.5} />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        to={item.href!}
        onClick={handleNavClick}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-[10px]'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent ml-0 pl-[10px]'
        )}
      >
        <Icon
          className={cn(
            'w-[18px] h-[18px] shrink-0 transition-colors duration-200',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
          strokeWidth={isActive ? 2 : 1.5}
        />
        <span className={cn(
          'text-sm transition-colors duration-200',
          isActive ? 'font-medium text-primary' : 'font-normal'
        )}>
          {item.label}
        </span>
        {item.badge && (
          <span className="ml-auto bg-primary/15 text-primary text-xs font-medium px-1.5 py-0.5 rounded">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            'fixed top-3 left-3 z-50 bg-card border border-border text-foreground hover:bg-muted',
            'transition-all duration-300 ease-in-out shadow-md rounded-lg',
            isOpen && 'left-[17rem]'
          )}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 animate-fade-in"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-background border-r border-border/50 flex flex-col',
          'transition-all duration-300 ease-in-out',
          isMobile
            ? isOpen
              ? 'w-64 translate-x-0'
              : 'w-64 -translate-x-full'
            : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
          <img
            src={logo}
            alt="Nuevos Hechos Logo"
            className="w-9 h-9 rounded-lg object-contain"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-base leading-tight">
              Nuevos Hechos
            </span>
            <span className="text-xs text-muted-foreground">Sistema Administrativo</span>
          </div>
        </div>

        {/* Navigation */}
        <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 mb-3 block">
              Principal
            </span>
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 mb-3 block">
              Gestión
            </span>
            {secondaryNavItems.map((item) => (
              <NavLink key={item.href || item.label} item={item} />
            ))}
          </div>
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-border/50 space-y-1">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              location.pathname === '/settings'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
            <span className="text-sm">Configuración</span>
          </Link>

          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform duration-200', !isOpen && 'rotate-180')} />
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
