import { Bell, Camera, Search, User } from 'lucide-react';
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
import { useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const { profile, setAvatar } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };


  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione una imagen');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      toast.success('Foto de perfil actualizada');
    };
    reader.readAsDataURL(file);
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
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
        </Button>

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