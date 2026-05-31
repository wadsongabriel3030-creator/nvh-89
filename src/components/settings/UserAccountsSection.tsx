import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, Trash2, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  AVAILABLE_PAGES,
  getAccounts,
  saveAccounts,
  type UserAccount,
  type UserAccountRole,
} from '@/lib/permissions';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'lider' as UserAccountRole,
  permissions: [] as string[],
};

export function UserAccountsSection() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof AVAILABLE_PAGES>();
    for (const p of AVAILABLE_PAGES) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries());
  }, []);

  const togglePermission = (path: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(path)
        ? f.permissions.filter((p) => p !== path)
        : [...f.permissions, path],
    }));
  };

  const toggleGroup = (paths: string[]) => {
    setForm((f) => {
      const allSelected = paths.every((p) => f.permissions.includes(p));
      return {
        ...f,
        permissions: allSelected
          ? f.permissions.filter((p) => !paths.includes(p))
          : Array.from(new Set([...f.permissions, ...paths])),
      };
    });
  };

  const selectAll = () =>
    setForm((f) => ({ ...f, permissions: AVAILABLE_PAGES.map((p) => p.path) }));
  const clearAll = () => setForm((f) => ({ ...f, permissions: [] }));

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Complete nombre, email y contraseña');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error('Ya existe una cuenta con ese email');
      return;
    }
    const newAccount: UserAccount = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      permissions:
        form.role === 'admin' ? AVAILABLE_PAGES.map((p) => p.path) : form.permissions,
      createdAt: new Date().toISOString(),
    };
    const next = [...accounts, newAccount];
    setAccounts(next);
    saveAccounts(next);
    toast.success(`Cuenta creada para ${newAccount.name}`);
    setForm(emptyForm);
    setShowPassword(false);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next);
    saveAccounts(next);
    setDeleteId(null);
    toast.success('Cuenta eliminada');
  };

  const roleLabel = (role: UserAccountRole) =>
    role === 'admin' ? 'Administrador (Apóstol)' : role === 'lider' ? 'Líder' : 'Servidor';

  const roleBadgeClass = (role: UserAccountRole) =>
    role === 'admin'
      ? 'bg-primary/15 text-primary'
      : role === 'lider'
      ? 'bg-accent/30 text-accent-foreground'
      : 'bg-muted text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Cuentas de usuario</CardTitle>
            </div>
            <CardDescription>
              Cree credenciales para líderes y defina a qué páginas pueden acceder. (Almacenado localmente — se migrará a Lovable Cloud)
            </CardDescription>
          </div>
          <Button onClick={() => setOpen(true)} className="shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Nueva cuenta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            Aún no se han creado cuentas. Cree una para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{a.name}</p>
                    <Badge variant="secondary" className={roleBadgeClass(a.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {roleLabel(a.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.role === 'admin'
                      ? 'Acceso total a todas las páginas'
                      : `${a.permissions.length} página(s) permitidas`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(a.id)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Crear nueva cuenta</DialogTitle>
            <DialogDescription>
              Defina las credenciales y los permisos de acceso a páginas.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="-mx-6 px-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="lider@iglesia.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v: UserAccountRole) => setForm({ ...form, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Apóstol)</SelectItem>
                      <SelectItem value="lider">Líder</SelectItem>
                      <SelectItem value="servidor">Servidor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {form.role === 'admin' ? (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <p>
                    El rol de <strong>Administrador</strong> tiene acceso total a todas las páginas
                    de la plataforma.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Permisos de acceso</Label>
                      <p className="text-xs text-muted-foreground">
                        Seleccione las páginas que este usuario podrá visualizar.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                        <Check className="w-3 h-3 mr-1" /> Todo
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                        Limpiar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {grouped.map(([group, pages]) => {
                      const paths = pages.map((p) => p.path);
                      const allSelected = paths.every((p) => form.permissions.includes(p));
                      const someSelected =
                        !allSelected && paths.some((p) => form.permissions.includes(p));
                      return (
                        <div
                          key={group}
                          className="rounded-lg border border-border p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                onCheckedChange={() => toggleGroup(paths)}
                              />
                              <span className="font-medium text-sm">{group}</span>
                            </label>
                            <span className="text-xs text-muted-foreground">
                              {paths.filter((p) => form.permissions.includes(p)).length}/
                              {paths.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                            {pages.map((page) => (
                              <label
                                key={page.path}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <Checkbox
                                  checked={form.permissions.includes(page.path)}
                                  onCheckedChange={() => togglePermission(page.path)}
                                />
                                <span className="text-foreground">{page.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear cuenta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cuenta</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La cuenta se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
