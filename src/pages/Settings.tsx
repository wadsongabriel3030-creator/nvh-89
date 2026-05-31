import { MainLayout } from '@/components/layout/MainLayout';
import { Settings as SettingsIcon, User, Shield, Database, Palette, Sun, Moon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';
import { toast } from 'sonner';
import { UserAccountsSection } from '@/components/settings/UserAccountsSection';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { profile, updateProfile, updateChurch, setAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground">
              Administre la configuración del sistema
            </p>
          </div>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Apariencia</CardTitle>
            </div>
            <CardDescription>Cambie entre modo claro y oscuro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active el modo claro para una interfaz luminosa con alto contraste
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'light'}
                onCheckedChange={toggleTheme}
                aria-label="Alternar modo claro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>Actualice su información personal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 group cursor-pointer"
                onClick={onPickAvatar}
                title="Cambiar foto de perfil"
              >
                <Avatar className="w-20 h-20 border border-border/50">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Foto de perfil</p>
                <p className="text-xs text-muted-foreground">Pase el mouse sobre la foto para cambiarla</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Input
                  value={profile.role}
                  onChange={(e) => updateProfile({ role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={() => toast.success('Cambios guardados')}>Guardar cambios</Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Seguridad</CardTitle>
            </div>
            <CardDescription>Administre su contraseña y autenticación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nueva contraseña</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirmar contraseña</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium">Autenticación de dos factores (2FA)</p>
                <p className="text-sm text-muted-foreground">Agregue una capa extra de seguridad</p>
              </div>
              <Switch />
            </div>
            <Button>Actualizar contraseña</Button>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <UserAccountsSection />

        {/* Church Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Información de la Iglesia</CardTitle>
            </div>
            <CardDescription>Datos de la iglesia Nuevos Hechos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la iglesia</Label>
              <Input
                value={profile.church.name}
                onChange={(e) => updateChurch({ name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={profile.church.phone}
                  onChange={(e) => updateChurch({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile.church.email}
                  onChange={(e) => updateChurch({ email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={profile.church.address}
                onChange={(e) => updateChurch({ address: e.target.value })}
              />
            </div>
            <Button onClick={() => toast.success('Información guardada')}>Guardar información</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}