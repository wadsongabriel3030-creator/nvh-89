import { Bell, Camera, Search, User, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markAllRead,
  markOneRead,
  type AppNotification,
} from '@/lib/notifications';

export function Header() {
  const { profile, uploadAvatar } = useProfile();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Notifications ─── */
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchNotifications(user.id);
    setNotifications(data);
  }, [user?.id]);

  // Load on mount and poll every 30s
  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30_000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    const updated = await markAllRead(user.id, notifications);
    setNotifications(updated);
  };

  const handleClickNotification = async (n: AppNotification) => {
    if (!user?.id) return;
    const updated = await markOneRead(user.id, notifications, n.id);
    setNotifications(updated);
    setNotifOpen(false);
    navigate(n.link ?? '/members');
  };

  /* ─── Avatar ─── */
  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione una imagen');
      return;
    }
    try {
      await uploadAvatar(file);
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('No se pudo guardar la foto en la base de datos.');
    }
    e.target.value = '';
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar miembros, eventos..."
          className="pl-10 bg-muted/30 border-border/50 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-muted/50 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ─── Notifications Bell ─── */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {unreadCount === 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-popover border-border" sideOffset={8}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <DropdownMenuLabel className="text-foreground p-0">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Marcar todas
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                Sin notificaciones
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleClickNotification(n)}
                    className={`w-full text-left px-3 py-3 hover:bg-muted transition-colors border-b border-border/30 last:border-0 ${
                      !n.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        {!n.read
                          ? <span className="w-2 h-2 rounded-full bg-primary block" />
                          : <span className="w-2 h-2 rounded-full bg-transparent block" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium leading-snug">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(n.createdAt).toLocaleString('es', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                          {n.from && ` · de ${n.from}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3 hover:bg-muted/50">
              <div
                className="relative w-8 h-8 group/avatar cursor-pointer"
                onClick={handleAvatarClick}
                title="Cambiar foto de perfil"
              >
                <Avatar className="w-8 h-8 border border-border/50">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-none text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{profile.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-foreground">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="text-foreground/80 focus:text-foreground focus:bg-muted">
              <Link to="/settings">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-foreground/80 focus:text-foreground focus:bg-muted">
              <Link to="/settings">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}