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
  Map,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavSubChild {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface NavSubItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  subChildren?: NavSubChild[];
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
  { icon: Users, label: 'Comunidad', href: '/members' },
  { icon: Tags, label: 'Etiquetas', href: '/tags' },
  { icon: Calendar, label: 'Eventos', href: '/events' },
  { icon: Calendar, label: 'Calendario 2026', href: '/calendar-2026' },
];

const secondaryNavItems: NavItem[] = [
  {
    icon: Church,
    label: 'Reunión Dominical',
    children: [
      { icon: Megaphone, label: 'Anuncios', href: '/reunion-dominical/recursos' },
      { icon: FileText, label: 'Programa', href: '/reunion-dominical/programa' },
      { icon: MessageCircle, label: 'Frases Institucionales', href: '/reunion-dominical/frases' },
      { icon: BookMarked, label: 'Versículos', href: '/reunion-dominical/versiculos' },
      { icon: Upload, label: 'Recursos', href: '/reunion-dominical/anuncios' },
      { icon: BookOpenCheck, label: 'Reporte Dominical', href: '/reunion-dominical/reporte-dominical' },
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
    icon: Heart,
    label: 'Vida en Libertad',
    children: [
      { icon: BookOpen, label: 'Curso Vida en Libertad', href: '/curso-vida-libertad' },
      { icon: Heart, label: 'Retiro Vida en Libertad', href: '/retiro-vida-libertad' },
    ]
  },

  { icon: Droplets, label: 'Bautismos', href: '/batismos' },
  {
    icon: BookOpen,
    label: 'Escuela de Equipamiento',
    children: [
      { icon: BookOpen, label: 'Nivel I', href: '/escuela-equipamiento' },
      { icon: GraduationCap, label: 'Cursos', href: '/cursos' },
      { icon: Users, label: 'Listado de Maestros', href: '/listado-lideres' },
      { icon: Calendar, label: 'Reuniones de mentores', href: '/reuniones-discipuladores' },
      { icon: BookOpenCheck, label: 'Guía de Mentor', href: '/guia-reunion-discipulado' },
      { icon: BookOpen, label: 'Proceso de Discipular', href: '/proceso-discipular' },
    ]
  },
  { icon: HandHeart, label: 'Discipulador', href: '/discipulador' },
  {
    icon: Map,
    label: 'Ruta del Discípulo',
    children: [
      { icon: Map, label: 'Ruta', href: '/ruta-discipulo' },
      { icon: Sparkles, label: 'Nueva Vida', href: '/membresia' },
      { icon: Footprints, label: 'Pasos Firmes', href: '/primeros-pasos' },
      {
        icon: GraduationCap,
        label: 'Escuela de Equipamiento',
        subChildren: [
          { icon: BookOpen, label: 'Nivel I', href: '/escuela-equipamiento/nivel-i' },
        ]
      },
    ]
  },
  { icon: BarChart3, label: 'Informes', href: '/reports' },
];

export function Sidebar() {
  const { isOpen, isMobile, toggle, close } = useSidebarContext();
  const location = useLocation();
  const perms = usePermissions();
  const navRef = useRef<HTMLElement>(null);

  const filterItems = (items: NavItem[]): NavItem[] => {
    // Admins always see everything; while loading, show all to avoid flicker
    if (perms.isAdmin || perms.loading) return items;
    // Non-admin users: only show pages they have explicit permission for
    const out: NavItem[] = [];
    for (const it of items) {
      if (it.children) {
        const kids = it.children.filter(c => {
          if (c.subChildren) {
            // Sub-group: keep if any sub-child is accessible
            return c.subChildren.some(sc => canAccessPath(perms, sc.href));
          }
          return c.href ? canAccessPath(perms, c.href) : false;
        });
        if (kids.length) out.push({ ...it, children: kids });
      } else if (it.href && canAccessPath(perms, it.href)) {
        out.push(it);
      }
    }
    return out;
  };

  const visibleMain = useMemo(() => filterItems(mainNavItems), [perms.isAdmin, perms.loading, perms.permissions]);
  const visibleSecondary = useMemo(() => filterItems(secondaryNavItems), [perms.isAdmin, perms.loading, perms.permissions]);
  const showSettings = perms.isAdmin || canAccessPath(perms, '/settings');

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand if current route matches a child or sub-child
    const expanded: string[] = [];
    secondaryNavItems.forEach(item => {
      if (item.children?.some(child => {
        if (child.href && location.pathname === child.href) return true;
        if (child.subChildren?.some(sc => location.pathname === sc.href)) return true;
        return false;
      })) {
        expanded.push(item.label);
      }
      // Also auto-expand sub-groups whose sub-child is active
      item.children?.forEach(child => {
        if (child.subChildren?.some(sc => location.pathname === sc.href)) {
          expanded.push(`sub-${child.label}`);
        }
      });
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
                // Sub-group: child has subChildren (e.g. Escuela de Equipamiento)
                if (child.subChildren) {
                  const subKey = `sub-${child.label}`;
                  const isSubExpanded = expandedItems.includes(subKey);
                  const isSubChildActive = child.subChildren.some(sc => location.pathname === sc.href);
                  const isSubSelfActive = child.href ? location.pathname === child.href : false;
                  const isSubActive = isSubChildActive || isSubSelfActive;
                  const SubIcon = child.icon;
                  return (
                    <div key={child.label}>
                      <button
                        onClick={() => toggleExpand(subKey)}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm w-full text-left',
                          isSubActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <SubIcon
                          className={cn('w-4 h-4 shrink-0', isSubActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
                          strokeWidth={isSubActive ? 2 : 1.5}
                        />
                        <span className="flex-1 text-sm">{child.label}</span>
                        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', isSubExpanded && 'rotate-180')} />
                      </button>
                      {isSubExpanded && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border/30 pl-2">
                          {child.subChildren.map(sc => {
                            const isScActive = location.pathname === sc.href;
                            const ScIcon = sc.icon;
                            return (
                              <Link
                                key={sc.href}
                                to={sc.href}
                                onClick={handleNavClick}
                                className={cn(
                                  'group flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs',
                                  isScActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                              >
                                <ScIcon
                                  className={cn('w-3.5 h-3.5 shrink-0', isScActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
                                  strokeWidth={isScActive ? 2 : 1.5}
                                />
                                {sc.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular child link
                const isActive = location.pathname === child.href;
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    to={child.href!}
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
          {visibleMain.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 mb-3 block">
                Principal
              </span>
              {visibleMain.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          )}

          {visibleSecondary.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 mb-3 block">
                Gestión
              </span>
              {visibleSecondary.map((item) => (
                <NavLink key={item.href || item.label} item={item} />
              ))}
            </div>
          )}
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-border/50 space-y-1">
          {showSettings && (
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
          )}


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
