import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookMarked, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';

/* ── Types ────────────────────────────────────────────────── */
interface Etapa {
  id: string;
  tiempo: string;
  avance: string;
}

interface PageData {
  pageTitle: string;
  intro: string;
  versiculo: string;
  versiculoRef: string;
  etapas: Etapa[];
  cierre: string;
  versiculoCierre: string;
  versiculoCierreRef: string;
}

/* ── Defaults ─────────────────────────────────────────────── */
const DEFAULT: PageData = {
  pageTitle: 'Proceso de Multiplicación del Discípulo',
  intro: 'Esto es diferente a la escuela de equipamiento, tiene que ver con el fruto en la vida de la persona, velar por su crecimiento espiritual y que se esté convirtiendo en un discípulo multiplicador.',
  versiculo: '"Sé diligente en conocer el estado de tus ovejas, y mira con cuidado por tus rebaños."',
  versiculoRef: 'Proverbios 27:23',
  etapas: [
    { id: '1', tiempo: '0 – 3 meses', avance: 'Abrir los Ojos de sus familiares, amigos y personas cercanas para compartirles el evangelio e invitarlos a la iglesia.' },
    { id: '2', tiempo: '3 – 6 meses', avance: 'Dar seguimiento a sus invitados, ayudándolos a integrarse e iniciar su proceso en la Ruta del Discípulo.' },
    { id: '3', tiempo: '6 – 9 meses', avance: 'Iniciar su propio discipulado con las personas, quienes han cambiado de Reino.' },
    { id: '4', tiempo: '9 – 12 meses', avance: 'Continuar siendo discipulado mientras ya está discipulando.' },
    { id: '5', tiempo: '12 meses en adelante', avance: 'De acuerdo con el criterio de su discipulador y pastores de discipulado, podrá alternar sus semanas de discipulado con su discipulador.' },
  ],
  cierre: 'Este es el Proceso de Multiplicación y fruto que un discipulador debe observar en su discípulo.',
  versiculoCierre: '"Lo que has oído de mí ante muchos testigos, esto encarga a hombres fieles que sean idóneos para enseñar también a otros."',
  versiculoCierreRef: '2 Timoteo 2:2',
};

function uid() { return Math.random().toString(36).slice(2, 9); }

/* ── Component ────────────────────────────────────────────── */
export default function ProcesoDiscipular() {
  const { value: data, setValue: setData, loading } = useDbStorage<PageData>(
    'proceso-discipular-v2',
    DEFAULT,
  );

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<PageData>(DEFAULT);

  const openEdit = () => { setDraft(JSON.parse(JSON.stringify(data ?? DEFAULT))); setEditMode(true); };
  const cancelEdit = () => setEditMode(false);
  const saveEdit = () => { setData(draft); setEditMode(false); toast.success('¡Proceso actualizado y guardado!'); };

  const updateEtapa = (id: string, field: keyof Etapa, val: string) =>
    setDraft(d => ({ ...d, etapas: d.etapas.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const addEtapa = () =>
    setDraft(d => ({ ...d, etapas: [...d.etapas, { id: uid(), tiempo: '', avance: '' }] }));
  const removeEtapa = (id: string) =>
    setDraft(d => ({ ...d, etapas: d.etapas.filter(e => e.id !== id) }));

  const current = data ?? DEFAULT;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 shrink-0 mt-1">
              <BookMarked className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              {editMode ? (
                <Input className="text-2xl font-bold h-11 w-80"
                  value={draft.pageTitle}
                  onChange={e => setDraft(d => ({ ...d, pageTitle: e.target.value }))} />
              ) : (
                <h1 className="text-3xl font-bold text-foreground">{loading ? '…' : current.pageTitle}</h1>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {editMode ? (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={cancelEdit}><X className="w-4 h-4" />Cancelar</Button>
                <Button size="sm" className="gap-1.5" onClick={saveEdit}><Check className="w-4 h-4" />Guardar</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}><Pencil className="w-4 h-4" />Editar</Button>
            )}
          </div>
        </div>

        {/* Intro card */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 space-y-3">
            {editMode ? (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Introducción</Label>
                  <Textarea rows={3} className="text-sm resize-none" value={draft.intro}
                    onChange={e => setDraft(d => ({ ...d, intro: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Versículo</Label>
                    <Textarea rows={2} className="text-xs resize-none" value={draft.versiculo}
                      onChange={e => setDraft(d => ({ ...d, versiculo: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Referencia</Label>
                    <Input className="text-xs h-8" value={draft.versiculoRef}
                      onChange={e => setDraft(d => ({ ...d, versiculoRef: e.target.value }))} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.intro}</p>
                <p className="text-sm italic text-muted-foreground">{current.versiculo}{' '}
                  <span className="font-bold text-amber-500 not-italic">{current.versiculoRef}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Table header */}
        <div className="grid grid-cols-[140px_1fr] gap-3 px-1">
          <div className="text-center py-2 px-3 rounded-lg bg-foreground text-background text-sm font-bold">Tiempo</div>
          <div className="text-center py-2 px-3 rounded-lg bg-foreground text-background text-sm font-bold">Avance</div>
        </div>

        {/* Etapas */}
        <div className="space-y-3">
          {(editMode ? draft.etapas : current.etapas).map((etapa, index) => (
            <div key={etapa.id} className="grid grid-cols-[140px_1fr] gap-3 items-start animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}>
              {/* Number + tiempo */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-background font-bold text-lg flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                {editMode ? (
                  <Input className="text-xs text-center h-8 font-semibold" value={etapa.tiempo}
                    placeholder="0 – 3 meses"
                    onChange={e => updateEtapa(etapa.id, 'tiempo', e.target.value)} />
                ) : (
                  <span className="text-sm font-bold text-foreground text-center leading-tight">{etapa.tiempo}</span>
                )}
              </div>

              {/* Avance */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  {editMode ? (
                    <div className="space-y-1">
                      <Textarea rows={3} className="text-sm resize-none" value={etapa.avance}
                        placeholder="Descripción del avance..."
                        onChange={e => updateEtapa(etapa.id, 'avance', e.target.value)} />
                      <button onClick={() => removeEtapa(etapa.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{etapa.avance}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {editMode && (
            <button onClick={addEtapa}
              className="w-full py-3 border-2 border-dashed border-amber-500/30 rounded-lg text-amber-500 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Agregar etapa
            </button>
          )}
        </div>

        {/* Cierre */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 space-y-3">
            {editMode ? (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Texto de cierre</Label>
                  <Textarea rows={2} className="text-sm resize-none" value={draft.cierre}
                    onChange={e => setDraft(d => ({ ...d, cierre: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Versículo de cierre</Label>
                    <Textarea rows={2} className="text-xs resize-none" value={draft.versiculoCierre}
                      onChange={e => setDraft(d => ({ ...d, versiculoCierre: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Referencia</Label>
                    <Input className="text-xs h-8" value={draft.versiculoCierreRef}
                      onChange={e => setDraft(d => ({ ...d, versiculoCierreRef: e.target.value }))} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground font-medium">{current.cierre}</p>
                <p className="text-sm italic text-muted-foreground">{current.versiculoCierre}{' '}
                  <span className="font-bold text-amber-500 not-italic">{current.versiculoCierreRef}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}
