import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useMembers } from '@/contexts/MembersContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  HandHeart,
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  ShieldX,
  ChevronRight,
  BookOpen,
  Video,
  Music,
  Coins,
  Megaphone,
  HeartHandshake,
  Eye,
  Loader2,
  CheckCircle2,
  Circle,
  X,
  UserMinus,
  Sparkles,
} from 'lucide-react';

// ── Ruta del Discípulo steps ──────────────────────────────────
const RUTA_STEPS = [
  { key: 'leccion_1', label: 'Lección 1 — Arrepentimiento', icon: BookOpen, group: 'Pasos Firmes' },
  { key: 'leccion_2', label: 'Lección 2 — Cambio de Reino', icon: BookOpen, group: 'Pasos Firmes' },
  { key: 'leccion_3', label: 'Lección 3 — Encuentro Diario', icon: BookOpen, group: 'Pasos Firmes' },
  { key: 'leccion_4', label: 'Lección 4 — Disciplinas Espirituales', icon: BookOpen, group: 'Pasos Firmes' },
  { key: 'semana_0', label: 'SEMANA 0 — Video de introducción', icon: Video, group: 'Disciplinas Espirituales' },
  { key: 'semana_1', label: 'SEMANA 1 — Oración y ayuno', icon: HeartHandshake, group: 'Disciplinas Espirituales' },
  { key: 'semana_2', label: 'SEMANA 2 — Leer predicar y practicar', icon: BookOpen, group: 'Disciplinas Espirituales' },
  { key: 'semana_3', label: 'SEMANA 3 — Adoración', icon: Music, group: 'Disciplinas Espirituales' },
  { key: 'semana_4', label: 'SEMANA 4 — Mayordomía', icon: Coins, group: 'Disciplinas Espirituales' },
  { key: 'semana_5', label: 'SEMANA 5 — Testificar', icon: Megaphone, group: 'Disciplinas Espirituales' },
  { key: 'semana_6', label: 'SEMANA 6 — Sencillez', icon: Sparkles, group: 'Disciplinas Espirituales' },
  { key: 'semana_7', label: 'SEMANA 7 — Servicio', icon: HandHeart, group: 'Disciplinas Espirituales' },
  { key: 'leccion_5', label: 'Lección 5 — Día antes', icon: BookOpen, group: 'Finalización' },
  { key: 'leccion_6', label: 'Lección 6 — Abrir los ojos', icon: Eye, group: 'Finalización' },
];

interface Discipulador {
  id: string;
  member_id: string;
  is_active: boolean;
  assigned_at: string;
}

interface DiscipuloRelation {
  id: string;
  discipulador_id: string;
  discipulo_member_id: string;
  is_active: boolean;
}

interface ProgresoStep {
  id: string;
  discipulo_member_id: string;
  step_key: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

type FilterType = 'todos' | 'discipuladores' | 'no-discipuladores';

export default function Discipulador() {
  const { members, loading: membersLoading } = useMembers();

  // Data state
  const [discipuladores, setDiscipuladores] = useState<Discipulador[]>([]);
  const [relaciones, setRelaciones] = useState<DiscipuloRelation[]>([]);
  const [progreso, setProgreso] = useState<ProgresoStep[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('todos');
  const [selectedDiscipuladorId, setSelectedDiscipuladorId] = useState<string | null>(null);
  const [showAddDiscipuloModal, setShowAddDiscipuloModal] = useState(false);
  const [showProgresoModal, setShowProgresoModal] = useState(false);
  const [selectedDiscipuloMemberId, setSelectedDiscipuloMemberId] = useState<string | null>(null);
  const [addDiscipuloSearch, setAddDiscipuloSearch] = useState('');
  const [savingProgress, setSavingProgress] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    const [dRes, rRes, pRes] = await Promise.all([
      supabase.from('discipuladores').select('*'),
      supabase.from('discipulador_discipulos').select('*'),
      supabase.from('discipulo_progreso').select('*'),
    ]);
    setDiscipuladores((dRes.data as Discipulador[] | null) ?? []);
    setRelaciones((rRes.data as DiscipuloRelation[] | null) ?? []);
    setProgreso((pRes.data as ProgresoStep[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ───────────────────────────────────────────
  const discipuladorByMemberId = useMemo(() => {
    const map = new Map<string, Discipulador>();
    discipuladores.forEach(d => map.set(d.member_id, d));
    return map;
  }, [discipuladores]);

  const discipulosByDiscipuladorId = useMemo(() => {
    const map = new Map<string, DiscipuloRelation[]>();
    relaciones.filter(r => r.is_active).forEach(r => {
      const arr = map.get(r.discipulador_id) ?? [];
      arr.push(r);
      map.set(r.discipulador_id, arr);
    });
    return map;
  }, [relaciones]);

  const progresoByDiscipulo = useMemo(() => {
    const map = new Map<string, Map<string, ProgresoStep>>();
    progreso.forEach(p => {
      if (!map.has(p.discipulo_member_id)) map.set(p.discipulo_member_id, new Map());
      map.get(p.discipulo_member_id)!.set(p.step_key, p);
    });
    return map;
  }, [progreso]);

  // ── Filtered members ───────────────────────────────────────
  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q) ||
        (m.phone ?? '').toLowerCase().includes(q)
      );
    }
    if (filter === 'discipuladores') {
      list = list.filter(m => discipuladorByMemberId.has(m.id) && discipuladorByMemberId.get(m.id)!.is_active);
    } else if (filter === 'no-discipuladores') {
      list = list.filter(m => !discipuladorByMemberId.has(m.id) || !discipuladorByMemberId.get(m.id)!.is_active);
    }
    return list;
  }, [members, search, filter, discipuladorByMemberId]);

  // ── Actions ────────────────────────────────────────────────
  const assignDiscipulador = async (memberId: string) => {
    const existing = discipuladorByMemberId.get(memberId);
    if (existing) {
      // reactivate
      const { error } = await supabase.from('discipuladores').update({ is_active: true } as any).eq('id', existing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('discipuladores').insert({ member_id: memberId } as any);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: '¡Discipulador asignado!', description: 'El miembro ahora tiene cargo de discipulador.' });
    await loadData();
  };

  const removeDiscipulador = async (memberId: string) => {
    const d = discipuladorByMemberId.get(memberId);
    if (!d) return;
    const { error } = await supabase.from('discipuladores').update({ is_active: false } as any).eq('id', d.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Cargo removido', description: 'El miembro ya no es discipulador.' });
    await loadData();
  };

  const addDiscipulo = async (discipuladorDbId: string, discipuloMemberId: string) => {
    // Check if already assigned
    const existing = relaciones.find(r => r.discipulador_id === discipuladorDbId && r.discipulo_member_id === discipuloMemberId);
    if (existing) {
      if (existing.is_active) {
        toast({ title: 'Ya asignado', description: 'Este discípulo ya está asignado a este discipulador.' });
        return;
      }
      const { error } = await supabase.from('discipulador_discipulos').update({ is_active: true } as any).eq('id', existing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('discipulador_discipulos').insert({
        discipulador_id: discipuladorDbId,
        discipulo_member_id: discipuloMemberId,
      } as any);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: '¡Discípulo agregado!', description: 'El miembro fue añadido como discípulo.' });
    setShowAddDiscipuloModal(false);
    setAddDiscipuloSearch('');
    await loadData();
  };

  const removeDiscipulo = async (relationId: string) => {
    const { error } = await supabase.from('discipulador_discipulos').update({ is_active: false } as any).eq('id', relationId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Discípulo removido' });
    await loadData();
  };

  const toggleProgress = async (discipuloMemberId: string, stepKey: string) => {
    setSavingProgress(stepKey);
    const existing = progresoByDiscipulo.get(discipuloMemberId)?.get(stepKey);
    if (existing) {
      const newCompleted = !existing.completed;
      const { error } = await supabase.from('discipulo_progreso').update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      } as any).eq('id', existing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSavingProgress(null); return; }
    } else {
      const { error } = await supabase.from('discipulo_progreso').insert({
        discipulo_member_id: discipuloMemberId,
        step_key: stepKey,
        completed: true,
        completed_at: new Date().toISOString(),
      } as any);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSavingProgress(null); return; }
    }
    await loadData();
    setSavingProgress(null);
  };

  // ── Helpers ────────────────────────────────────────────────
  const getMemberName = (id: string) => {
    const m = members.find(m => m.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
  };

  const getMember = (id: string) => members.find(m => m.id === id);

  const getCompletedCount = (memberId: string) => {
    const steps = progresoByDiscipulo.get(memberId);
    if (!steps) return 0;
    return Array.from(steps.values()).filter(s => s.completed).length;
  };

  const getProgressPercent = (memberId: string) => {
    return Math.round((getCompletedCount(memberId) / RUTA_STEPS.length) * 100);
  };

  // Selected discipulador data
  const selectedDiscipulador = selectedDiscipuladorId
    ? discipuladores.find(d => d.id === selectedDiscipuladorId)
    : null;
  const selectedDiscipulos = selectedDiscipuladorId
    ? (discipulosByDiscipuladorId.get(selectedDiscipuladorId) ?? [])
    : [];

  // Members available to add as discípulos
  const availableForDiscipulo = useMemo(() => {
    if (!selectedDiscipuladorId) return [];
    const alreadyAssigned = new Set(selectedDiscipulos.map(r => r.discipulo_member_id));
    const discipuladorMemberId = selectedDiscipulador?.member_id;
    let list = members.filter(m => m.id !== discipuladorMemberId && !alreadyAssigned.has(m.id));
    if (addDiscipuloSearch) {
      const q = addDiscipuloSearch.toLowerCase();
      list = list.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q));
    }
    return list;
  }, [members, selectedDiscipuladorId, selectedDiscipulos, addDiscipuloSearch, selectedDiscipulador]);

  // Active discipuladores list
  const activeDiscipuladores = useMemo(() =>
    discipuladores.filter(d => d.is_active),
  [discipuladores]);

  if (membersLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <HandHeart className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Discipulador</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona discipuladores, asigna discípulos y sigue la Ruta del Discípulo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {activeDiscipuladores.length} Discipulador{activeDiscipuladores.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discipuladores" className="space-y-5">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="discipuladores" className="gap-2">
              <HandHeart className="w-4 h-4" />
              Discipuladores
            </TabsTrigger>
            <TabsTrigger value="miembros" className="gap-2">
              <Users className="w-4 h-4" />
              Todos los Miembros
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Discipuladores ────────────────────────── */}
          <TabsContent value="discipuladores" className="space-y-5">
            {activeDiscipuladores.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HandHeart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay discipuladores asignados aún.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ve a la pestaña "Todos los Miembros" para asignar el cargo de discipulador.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {activeDiscipuladores.map((d, idx) => {
                  const member = getMember(d.member_id);
                  const discipulos = discipulosByDiscipuladorId.get(d.id) ?? [];
                  return (
                    <Card
                      key={d.id}
                      className="hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Purple top accent */}
                      <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {member?.firstName?.charAt(0)}{member?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {member ? `${member.firstName} ${member.lastName}` : 'Desconocido'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                                Discipulador
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {discipulos.length} discípulo{discipulos.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Discipulos list */}
                        {discipulos.length > 0 ? (
                          <div className="space-y-2">
                            {discipulos.map(rel => {
                              const dm = getMember(rel.discipulo_member_id);
                              const pct = getProgressPercent(rel.discipulo_member_id);
                              const completed = getCompletedCount(rel.discipulo_member_id);
                              return (
                                <div
                                  key={rel.id}
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group cursor-pointer"
                                  onClick={() => {
                                    setSelectedDiscipuloMemberId(rel.discipulo_member_id);
                                    setSelectedDiscipuladorId(d.id);
                                    setShowProgresoModal(true);
                                  }}
                                >
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                                    {dm?.firstName?.charAt(0)}{dm?.lastName?.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {dm ? `${dm.firstName} ${dm.lastName}` : 'Desconocido'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${pct}%`,
                                            background: pct === 100
                                              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                              : 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {completed}/{RUTA_STEPS.length}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); removeDiscipulo(rel.id); }}
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </Button>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-3">
                            Sin discípulos asignados
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => {
                            setSelectedDiscipuladorId(d.id);
                            setShowAddDiscipuloModal(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Agregar Discípulo
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── TAB: Todos los Miembros ────────────────────── */}
          <TabsContent value="miembros" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar miembro por nombre, email o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  id="search-members"
                />
              </div>
              <div className="flex gap-2">
                {(['todos', 'discipuladores', 'no-discipuladores'] as FilterType[]).map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f === 'todos' ? 'Todos' : f === 'discipuladores' ? 'Discipuladores' : 'Sin Cargo'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Members table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Miembro
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                          Estado
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                          Teléfono
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Cargo
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredMembers.map((m, idx) => {
                        const isDiscipulador = discipuladorByMemberId.has(m.id) && discipuladorByMemberId.get(m.id)!.is_active;
                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-muted/30 transition-colors animate-fade-in"
                            style={{ animationDelay: `${Math.min(idx, 20) * 30}ms` }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                                  isDiscipulador
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{m.firstName} {m.lastName}</p>
                                  {m.email && (
                                    <p className="text-xs text-muted-foreground">{m.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <Badge variant={m.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {m.status === 'active' ? 'Activo' : m.status === 'inactive' ? 'Inactivo' : 'Visitante'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">{m.phone || '—'}</span>
                            </td>
                            <td className="px-4 py-3">
                              {isDiscipulador ? (
                                <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Discipulador
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isDiscipulador ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-destructive hover:text-destructive"
                                  onClick={() => removeDiscipulador(m.id)}
                                >
                                  <ShieldX className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Quitar</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() => assignDiscipulador(m.id)}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Asignar</span>
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      No se encontraron miembros con los filtros aplicados.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground text-center">
              Mostrando {filteredMembers.length} de {members.length} miembros
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modal: Agregar Discípulo ──────────────────────── */}
      <Dialog open={showAddDiscipuloModal} onOpenChange={(open) => { setShowAddDiscipuloModal(open); if (!open) setAddDiscipuloSearch(''); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-500" />
              Agregar Discípulo
            </DialogTitle>
            <DialogDescription>
              Selecciona un miembro para agregarlo como discípulo de{' '}
              <span className="font-semibold">
                {selectedDiscipulador ? getMemberName(selectedDiscipulador.member_id) : ''}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar miembro..."
              value={addDiscipuloSearch}
              onChange={(e) => setAddDiscipuloSearch(e.target.value)}
              className="pl-9"
              id="search-add-discipulo"
            />
          </div>
          <ScrollArea className="max-h-[350px]">
            <div className="space-y-1">
              {availableForDiscipulo.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No se encontraron miembros disponibles.
                </p>
              ) : (
                availableForDiscipulo.map(m => (
                  <button
                    key={m.id}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                    onClick={() => selectedDiscipuladorId && addDiscipulo(selectedDiscipuladorId, m.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-muted-foreground">{m.phone || m.email || ''}</p>
                    </div>
                    <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Progreso del Discípulo (Ruta) ─────────── */}
      <Dialog open={showProgresoModal} onOpenChange={(open) => { setShowProgresoModal(open); if (!open) setSelectedDiscipuloMemberId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Ruta del Discípulo
            </DialogTitle>
            <DialogDescription>
              {selectedDiscipuloMemberId && (
                <>
                  Progreso de{' '}
                  <span className="font-semibold">{getMemberName(selectedDiscipuloMemberId)}</span>
                  {' — '}
                  <span className="font-semibold text-purple-500">
                    {getCompletedCount(selectedDiscipuloMemberId)}/{RUTA_STEPS.length} completados
                    ({getProgressPercent(selectedDiscipuloMemberId)}%)
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedDiscipuloMemberId && (
            <>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${getProgressPercent(selectedDiscipuloMemberId)}%`,
                    background: getProgressPercent(selectedDiscipuloMemberId) === 100
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #8b5cf6, #a855f7, #6366f1)'
                  }}
                />
              </div>

              <ScrollArea className="flex-1 pr-3 -mr-3">
                <div className="space-y-1 py-2">
                  {(() => {
                    let lastGroup = '';
                    return RUTA_STEPS.map((step, idx) => {
                      const stepsMap = progresoByDiscipulo.get(selectedDiscipuloMemberId);
                      const stepProgress = stepsMap?.get(step.key);
                      const isCompleted = stepProgress?.completed ?? false;
                      const StepIcon = step.icon;
                      const showGroup = step.group !== lastGroup;
                      lastGroup = step.group;

                      return (
                        <div key={step.key}>
                          {showGroup && (
                            <div className="flex items-center gap-2 pt-3 pb-1.5">
                              <div className="h-px flex-1 bg-border/60" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-2">
                                {step.group}
                              </span>
                              <div className="h-px flex-1 bg-border/60" />
                            </div>
                          )}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-500/5 hover:bg-green-500/10'
                                : 'bg-muted/20 hover:bg-muted/40'
                            }`}
                          >
                            {/* Step number / icon */}
                            <div className={`relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {savingProgress === step.key ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <StepIcon className="w-4 h-4" />
                              )}
                            </div>

                            {/* Connector line */}
                            {idx < RUTA_STEPS.length - 1 && (
                              <div className="absolute left-[2.15rem] mt-[3.5rem] w-0.5 h-4 bg-border/40" style={{ display: 'none' }} />
                            )}

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium transition-colors ${
                                isCompleted ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                              }`}>
                                {step.label}
                              </p>
                              {isCompleted && stepProgress?.completed_at && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Completado: {new Date(stepProgress.completed_at).toLocaleDateString('es-GT', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </p>
                              )}
                            </div>

                            {/* Toggle */}
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleProgress(selectedDiscipuloMemberId!, step.key)}
                              disabled={savingProgress !== null}
                              className={`h-5 w-5 shrink-0 ${
                                isCompleted
                                  ? 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                                  : ''
                              }`}
                              id={`step-${step.key}`}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
