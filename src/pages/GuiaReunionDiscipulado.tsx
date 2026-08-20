import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookOpen, Pencil, Check, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Paso {
  id: string;
  titulo: string;
  descripcion: string; // puede contener \n para bullet lines
}

interface Objetivo {
  id: string;
  titulo: string;
  descripcion: string;
}

interface GuiaData {
  pageTitle: string;
  pageSubtitle: string;
  rolDiscipulador: string;
  rolDiscipulo: string;
  pasos: Paso[];
  objetivoIntro: string;
  objetivos: Objetivo[];
}

/* ── Defaults ───────────────────────────────────────────────────────── */
const DEFAULT: GuiaData = {
  pageTitle: 'Discipulado',
  pageSubtitle: 'Guía para cada reunión semanal que se tiene con el discípulo',
  rolDiscipulador: 'Pastorear a sus ovejas (discípulos): guiarlos, cuidar, velar por su crecimiento espiritual y asegurarse que se multipliquen e inicien su propio discipulado.',
  rolDiscipulo: 'Seguir la Ruta del Discípulo, asistir fielmente a su tiempo de discipulado y iniciar el Proceso de Multiplicación de Discípulo.',
  pasos: [
    {
      id: '1',
      titulo: 'El Día Antes',
      descripcion: 'Prepararnos con una Palabra revelada de parte de Dios. Orar por nombre, interceder y escuchar la Palabra, ya sea profética o versículo(s) revelado(s) de parte del Señor que sean específicamente para la persona.',
    },
    {
      id: '2',
      titulo: 'Darles la Palabra de Parte De Dios',
      descripcion: 'Iniciar compartiendo la palabra, mensaje y/o versículo(s) que Dios nos haya dado.\nInmediatamente, tomar un tiempo para orar por la persona.',
    },
    {
      id: '3',
      titulo: 'Acompañamiento del Caminar Espiritual',
      descripcion: 'Hacer preguntas sobre su Caminar Espiritual:\n• ¿Cómo realizas tu Encuentro Diario (devocional diario)?\n• ¿Qué te ha hablado Dios esta semana?\n• ¿Qué tan constante y profundo es tu tiempo de oración diaria?\n• ¿Llevas a cabo diariamente tu Plan de Lectura Bíblica?\n• ¿Con qué frecuencia reflexionas y aplicas en tu vida diaria lo que aprendes a través de la Palabra?\n• ¿Con qué regularidad practicas el Ayuno como Disciplina Espiritual?\n• ¿Qué tan constante eres participando en: Reunión Dominical, PLC y Mentorías?\n• ¿Eres constante en tu dar (diezmos/ofrendas/primicias/ayuda a los demás)?\n• ¿Con qué frecuencia compartes sobre Jesús con otros que no conocen o están lejos de Jesús?',
    },
    {
      id: '4',
      titulo: 'Contenido de Enseñanza',
      descripcion: 'Impartir la enseñanza correspondiente.\n(Los Valores del Reino).',
    },
    {
      id: '5',
      titulo: 'Orar con el Discípulo',
      descripcion: 'Asegurarse que el discípulo aprenda a orar.',
    },
  ],
  objetivoIntro: 'Al momento de ganar a una persona, debemos aprovechar el hambre que tienen por el Señor y nutrirle lo más posible.',
  objetivos: [
    { id: 'a', titulo: 'Admitir', descripcion: 'que el discípulo admita que es parte de la Historia de Dios, por lo que necesita reconciliarse con Dios y seguir a Jesús.' },
    { id: 'b', titulo: 'Comprometer', descripcion: 'que el discípulo esté comprometido en su relación con Jesús y su propio crecimiento espiritual (aplicando las disciplinas espirituales).' },
    { id: 'c', titulo: 'Someter', descripcion: 'que el discípulo aprenda a someter su vida entera a Dios, viviendo en obediencia radical, oración ferviente y rendición total.' },
    { id: 'd', titulo: 'Transmitir', descripcion: 'el discípulo se convierte en un transmisor del mensaje de Jesús de tiempo completo y se multiplica en más discípulos de Jesús.' },
  ],
};

/* ── Helpers ────────────────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 9); }

/** Render multi-line text with bullet support */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split('\n').map((line, i) => (
        <p key={i} className="text-muted-foreground text-sm leading-relaxed">{line}</p>
      ))}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function GuiaReunionDiscipulado() {
  const { value: data, setValue: setData, loading } = useDbStorage<GuiaData>(
    'guia-discipulado-v2',
    DEFAULT,
  );

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<GuiaData>(DEFAULT);

  const openEdit = () => {
    setDraft(JSON.parse(JSON.stringify(data ?? DEFAULT)));
    setEditMode(true);
  };
  const cancelEdit = () => setEditMode(false);
  const saveEdit = () => {
    setData(draft);
    setEditMode(false);
    toast.success('¡Guía actualizada y guardada!');
  };

  const updatePaso = (id: string, field: keyof Paso, val: string) =>
    setDraft(d => ({ ...d, pasos: d.pasos.map(p => p.id === id ? { ...p, [field]: val } : p) }));

  const addPaso = () =>
    setDraft(d => ({ ...d, pasos: [...d.pasos, { id: uid(), titulo: '', descripcion: '' }] }));

  const removePaso = (id: string) =>
    setDraft(d => ({ ...d, pasos: d.pasos.filter(p => p.id !== id) }));

  const updateObjetivo = (id: string, field: keyof Objetivo, val: string) =>
    setDraft(d => ({ ...d, objetivos: d.objetivos.map(o => o.id === id ? { ...o, [field]: val } : o) }));

  const addObjetivo = () =>
    setDraft(d => ({ ...d, objetivos: [...d.objetivos, { id: uid(), titulo: '', descripcion: '' }] }));

  const removeObjetivo = (id: string) =>
    setDraft(d => ({ ...d, objetivos: d.objetivos.filter(o => o.id !== id) }));

  const current = data ?? DEFAULT;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              {editMode ? (
                <div className="space-y-1">
                  <Input className="text-2xl font-bold h-10 w-72" value={draft.pageTitle}
                    onChange={e => setDraft(d => ({ ...d, pageTitle: e.target.value }))} />
                  <Input className="text-sm h-8 w-72" value={draft.pageSubtitle}
                    onChange={e => setDraft(d => ({ ...d, pageSubtitle: e.target.value }))} />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground">{loading ? '…' : current.pageTitle}</h1>
                  <p className="text-muted-foreground">{current.pageSubtitle}</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" className="gap-2" onClick={cancelEdit}><X className="w-4 h-4" />Cancelar</Button>
                <Button className="gap-2" onClick={saveEdit}><Check className="w-4 h-4" />Guardar</Button>
              </>
            ) : (
              <Button variant="outline" className="gap-2" onClick={openEdit}><Pencil className="w-4 h-4" />Editar Guía</Button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* ── ROL section ─────────────────────────────────────────── */}
          <Card className="border-amber-500/40 bg-amber-500/5 animate-fade-in">
            <CardContent className="p-5 space-y-3">
              {editMode ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-amber-500 uppercase tracking-wide">ROL DEL DISCIPULADOR</Label>
                    <Textarea rows={3} className="text-sm resize-none"
                      value={draft.rolDiscipulador}
                      onChange={e => setDraft(d => ({ ...d, rolDiscipulador: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-amber-500 uppercase tracking-wide">ROL DEL DISCÍPULO</Label>
                    <Textarea rows={3} className="text-sm resize-none"
                      value={draft.rolDiscipulo}
                      onChange={e => setDraft(d => ({ ...d, rolDiscipulo: e.target.value }))} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">ROL DEL DISCIPULADOR: </span>
                    {current.rolDiscipulador}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">ROL DEL DISCÍPULO: </span>
                    {current.rolDiscipulo}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Pasos ───────────────────────────────────────────────── */}
          {(editMode ? draft.pasos : current.pasos).map((paso, index) => (
            <Card
              key={paso.id}
              className="hover:shadow-soft transition-all duration-300 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="space-y-2 flex-1">
                    {editMode ? (
                      <>
                        <Input className="font-bold text-base" value={paso.titulo}
                          placeholder="Título del paso"
                          onChange={e => updatePaso(paso.id, 'titulo', e.target.value)} />
                        <Textarea className="text-sm resize-none" rows={5} value={paso.descripcion}
                          placeholder="Descripción (usa \n para nueva línea, • para bullets)"
                          onChange={e => updatePaso(paso.id, 'descripcion', e.target.value)} />
                        <button onClick={() => removePaso(paso.id)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" /> Eliminar paso
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-foreground text-base">{paso.titulo}</h3>
                        <RichText text={paso.descripcion} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {editMode && (
            <button onClick={addPaso}
              className="w-full py-3 border-2 border-dashed border-amber-500/30 rounded-lg text-amber-500 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Agregar paso
            </button>
          )}

          {/* ── Objetivo de Discipular ───────────────────────────────── */}
          <Card className="border-amber-500/30 bg-amber-500/5 animate-fade-in"
            style={{ animationDelay: `${current.pasos.length * 60}ms` }}>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-foreground text-lg">Objetivo de Discipular</h3>
              {editMode ? (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Texto introductorio</Label>
                  <Textarea rows={3} className="text-sm resize-none" value={draft.objetivoIntro}
                    onChange={e => setDraft(d => ({ ...d, objetivoIntro: e.target.value }))} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="font-bold text-foreground">IMPORTANTE: </span>
                  {current.objetivoIntro}
                </p>
              )}

              <div className="space-y-3">
                {(editMode ? draft.objetivos : current.objetivos).map((obj, i) => (
                  <div key={obj.id} className="text-sm">
                    {editMode ? (
                      <div className="space-y-1 border border-border/40 rounded-lg p-3 bg-background/40">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                          <Input className="font-bold text-sm h-8" value={obj.titulo} placeholder="Título"
                            onChange={e => updateObjetivo(obj.id, 'titulo', e.target.value)} />
                          <button onClick={() => removeObjetivo(obj.id)} className="text-red-400 hover:text-red-500 shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <Textarea rows={2} className="text-xs resize-none ml-5" value={obj.descripcion} placeholder="Descripción"
                          onChange={e => updateObjetivo(obj.id, 'descripcion', e.target.value)} />
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-foreground">{i + 1}. {obj.titulo}</span>
                        <span className="text-muted-foreground"> - {obj.descripcion}</span>
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={addObjetivo}
                    className="w-full py-2 border border-dashed border-amber-500/30 rounded-lg text-amber-500 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-xs flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Agregar objetivo
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
