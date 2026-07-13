import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, Trash2, Shield, Eye, EyeOff, Check, Loader2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { AVAILABLE_PAGES } from '@/lib/permissions';

type UiRole = 'admin' | 'lider' | 'servidor';

interface Account {
  user_id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'pastor' | 'leader' | 'server' | 'member';
  permissions: string[];
  created_at: string;
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'lider' as UiRole,
  permissions: [] as string[],
};

const roleLabel = (role: Account['role']) =>
  role === 'admin' ? 'Administrador (Apóstol)'
    : role === 'pastor' ? 'Pastor'
    : role === 'leader' ? 'Líder'
    : role === 'server' ? 'Servidor'
    : 'Miembro';

const roleBadgeClass = (role: Account['role']) =>
  role === 'admin' ? 'bg-primary/15 text-primary'
    : role === 'leader' || role === 'pastor' ? 'bg-accent/30 text-accent-foreground'
    : 'bg-muted text-muted-foreground';

/** Resolve permission paths to their human-readable labels */
const permissionLabels = (paths: string[]): { group: string; label: string }[] => {
  const lookup = new Map(AVAILABLE_PAGES.map((p) => [p.path, p]));
  return paths
    .map((p) => lookup.get(p))
    .filter(Boolean)
    .map((p) => ({ group: p!.group, label: p!.label }));
};

export function UserAccountsSection() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit permissions state
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Expanded permissions view per account
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof AVAILABLE_PAGES>();
    for (const p of AVAILABLE_PAGES) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries());
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_accounts');
    if (error) {
      toast.error(error.message);
      setAccounts([]);
    } else {
      setAccounts((data ?? []) as Account[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  // --- Create form helpers ---
  const togglePermission = (path: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(path)
        ? f.permissions.filter((p) => p !== path)
        : [...f.permissions, path],
    }));

  const toggleGroup = (paths: string[]) =>
    setForm((f) => {
      const allSelected = paths.every((p) => f.permissions.includes(p));
      return {
        ...f,
        permissions: allSelected
          ? f.permissions.filter((p) => !paths.includes(p))
          : Array.from(new Set([...f.permissions, ...paths])),
      };
    });

  const selectAll = () => setForm((f) => ({ ...f, permissions: AVAILABLE_PAGES.map((p) => p.path) }));
  const clearAll = () => setForm((f) => ({ ...f, permissions: [] }));

  // --- Edit form helpers ---
  const editTogglePermission = (path: string) =>
    setEditPermissions((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );

  const editToggleGroup = (paths: string[]) =>
    setEditPermissions((prev) => {
      const allSelected = paths.every((p) => prev.includes(p));
      return allSelected
        ? prev.filter((p) => !paths.includes(p))
        : Array.from(new Set([...prev, ...paths]));
    });

  const editSelectAll = () => setEditPermissions(AVAILABLE_PAGES.map((p) => p.path));
  const editClearAll = () => setEditPermissions([]);

  const openEditDialog = (account: Account) => {
    setEditAccount(account);
    setEditPermissions([...account.permissions]);
  };

  const handleEditSave = async () => {
    if (!editAccount) return;
    setEditSubmitting(true);
    const { error } = await supabase
      .from('user_permissions')
      .update({ permissions: editPermissions })
      .eq('user_id', editAccount.user_id);
    setEditSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Permisos actualizados para ${editAccount.display_name}`);
    setEditAccount(null);
    loadAccounts();
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Complete nombre, email y contraseña');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSubmitting(true);
    const permissions = form.role === 'admin' ? AVAILABLE_PAGES.map((p) => p.path) : form.permissions;
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        permissions,
      },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? 'Error al crear cuenta');
      return;
    }
    toast.success(`Cuenta creada para ${form.name.trim()}`);
    setForm(emptyForm);
    setShowPassword(false);
    setOpen(false);
    loadAccounts();
  };

  const handleDelete = async (id: string) => {
    const { data, error } = await supabase.functions.invoke('admin-delete-user', { body: { user_id: id } });
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? 'Error al eliminar');
      return;
    }
    setDeleteId(null);
    toast.success('Cuenta eliminada');
    loadAccounts();
  };

  /** Renders the grouped permission checkboxes (reused in both create & edit dialogs) */
  const renderPermissionCheckboxes = (
    perms: string[],
    onToggle: (path: string) => void,
    onToggleGroup: (paths: string[]) => void,
    onSelectAll: () => void,
    onClearAll: () => void,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Permisos de acceso</Label>
          <p className="text-xs text-muted-foreground">Seleccione las páginas que este usuario podrá visualizar.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onSelectAll}><Check className="w-3 h-3 mr-1" /> Todo</Button>
          <Button type="button" variant="outline" size="sm" onClick={onClearAll}>Limpiar</Button>
        </div>
      </div>

      <div className="space-y-3">
        {grouped.map(([group, pages]) => {
          const paths = pages.map((p) => p.path);
          const allSelected = paths.every((p) => perms.includes(p));
          const someSelected = !allSelected && paths.some((p) => perms.includes(p));
          return (
            <div key={group} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={() => onToggleGroup(paths)} />
                  <span className="font-medium text-sm">{group}</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  {paths.filter((p) => perms.includes(p)).length}/{paths.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                {pages.map((page) => (
                  <label key={page.path} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox checked={perms.includes(page.path)} onCheckedChange={() => onToggle(page.path)} />
                    <span className="text-foreground">{page.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
              Cree credenciales reales para líderes y defina a qué páginas pueden acceder.
            </CardDescription>
          </div>
          <Button onClick={() => setOpen(true)} className="shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Nueva cuenta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando cuentas…
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            Aún no se han creado cuentas. Cree una para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => {
              const isExpanded = expandedId === a.user_id;
              const labels = a.role !== 'admin' ? permissionLabels(a.permissions) : [];
              // Group labels by group name for display
              const groupedLabels = new Map<string, string[]>();
              for (const l of labels) {
                if (!groupedLabels.has(l.group)) groupedLabels.set(l.group, []);
                groupedLabels.get(l.group)!.push(l.label);
              }
              return (
                <div
                  key={a.user_id}
                  className="rounded-lg border border-border bg-card overflow-hidden transition-all"
                >
                  {/* Main row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{a.display_name}</p>
                        <Badge variant="secondary" className={roleBadgeClass(a.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {roleLabel(a.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.email}</p>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : a.user_id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-0.5"
                      >
                        {a.role === 'admin'
                          ? 'Acceso total a todas las páginas'
                          : `${a.permissions.length} página(s) permitidas`}
                        {a.role !== 'admin' && a.permissions.length > 0 && (
                          isExpanded
                            ? <ChevronUp className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(a)}
                        className="text-primary hover:text-primary"
                        disabled={a.role === 'admin'}
                        title={a.role === 'admin' ? 'Administradores tienen acceso total' : 'Editar permisos'}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(a.user_id)}
                        className="text-destructive hover:text-destructive shrink-0"
                        disabled={a.role === 'admin'}
                        title={a.role === 'admin' ? 'No se puede eliminar un administrador' : 'Eliminar'}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  {/* Expanded permissions detail */}
                  {isExpanded && a.role !== 'admin' && a.permissions.length > 0 && (
                    <div className="px-4 pb-4 pt-0">
                      <Separator className="mb-3" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from(groupedLabels.entries()).map(([group, pageLabels]) => (
                          <div key={group} className="rounded-md bg-muted/40 border border-border/50 p-2.5">
                            <p className="text-xs font-semibold text-foreground mb-1.5">{group}</p>
                            <div className="flex flex-wrap gap-1">
                              {pageLabels.map((label) => (
                                <Badge key={label} variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Crear nueva cuenta</DialogTitle>
            <DialogDescription>
              Defina las credenciales y los permisos de acceso a páginas. El usuario podrá iniciar sesión con este email y contraseña.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="-mx-6 px-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="lider@iglesia.com" />
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
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={form.role} onValueChange={(v: UiRole) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <p>El rol de <strong>Administrador</strong> tiene acceso total a todas las páginas de la plataforma.</p>
                </div>
              ) : (
                renderPermissionCheckboxes(form.permissions, togglePermission, toggleGroup, selectAll, clearAll)
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando…</> : 'Crear cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit permissions dialog */}
      <Dialog open={!!editAccount} onOpenChange={(o) => !o && setEditAccount(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar permisos</DialogTitle>
            <DialogDescription>
              Modifique los permisos de acceso para <strong>{editAccount?.display_name}</strong> ({editAccount?.email}).
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="-mx-6 px-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 py-2">
              {/* Summary of current state */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Actualmente tiene <strong>{editPermissions.length}</strong> de {AVAILABLE_PAGES.length} páginas permitidas.
                </span>
              </div>

              {renderPermissionCheckboxes(editPermissions, editTogglePermission, editToggleGroup, editSelectAll, editClearAll)}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccount(null)} disabled={editSubmitting}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={editSubmitting}>
              {editSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando…</> : 'Guardar permisos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cuenta</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer. El acceso del usuario se eliminará permanentemente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
