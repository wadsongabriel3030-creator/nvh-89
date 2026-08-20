import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';

interface Reunion {
  id: string;
  fecha: string;
}

interface PageData {
  pageTitle: string;
  pageSubtitle: string;
  reuniones: Reunion[];
}

const DEFAULT: PageData = {
  pageTitle: 'Reuniones de Discipuladores',
  pageSubtitle: 'Calendario de reuniones para discipuladores',
  reuniones: [
    { id: '1', fecha: 'Domingo 25 de Enero' },
    { id: '2', fecha: 'Domingo 15 de Marzo' },
    { id: '3', fecha: 'Domingo 24 de Mayo' },
    { id: '4', fecha: 'Domingo 19 de Julio' },
    { id: '5', fecha: 'Domingo 13 de Septiembre' },
    { id: '6', fecha: 'Domingo 29 de Noviembre' },
  ],
};

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function ReunionesDiscipuladores() {
  const { value: data, setValue: setData, loading } = useDbStorage<PageData>(
    'reuniones-discipuladores-content',
    DEFAULT,
  );

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<PageData>(DEFAULT);

  const openEdit = () => {
    setDraft(JSON.parse(JSON.stringify(data ?? DEFAULT)));
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const saveEdit = () => {
    setData(draft);
    setEditMode(false);
    toast.success('¡Reuniones actualizadas y guardadas!');
  };

  const updateFecha = (id: string, val: string) =>
    setDraft(d => ({ ...d, reuniones: d.reuniones.map(r => r.id === id ? { ...r, fecha: val } : r) }));

  const addReunion = () =>
    setDraft(d => ({ ...d, reuniones: [...d.reuniones, { id: uid(), fecha: '' }] }));

  const removeReunion = (id: string) =>
    setDraft(d => ({ ...d, reuniones: d.reuniones.filter(r => r.id !== id) }));

  const current = data ?? DEFAULT;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              {editMode ? (
                <div className="space-y-1">
                  <Input
                    className="text-2xl font-bold h-10 w-72"
                    value={draft.pageTitle}
                    onChange={e => setDraft(d => ({ ...d, pageTitle: e.target.value }))}
                  />
                  <Input
                    className="text-sm h-8 w-72"
                    value={draft.pageSubtitle}
                    onChange={e => setDraft(d => ({ ...d, pageSubtitle: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground">
                    {loading ? '…' : current.pageTitle}
                  </h1>
                  <p className="text-muted-foreground">{current.pageSubtitle}</p>
                </>
              )}
            </div>
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" className="gap-2" onClick={cancelEdit}>
                  <X className="w-4 h-4" /> Cancelar
                </Button>
                <Button className="gap-2" onClick={saveEdit}>
                  <Check className="w-4 h-4" /> Guardar
                </Button>
              </>
            ) : (
              <Button variant="outline" className="gap-2" onClick={openEdit}>
                <Pencil className="w-4 h-4" /> Editar
              </Button>
            )}
          </div>
        </div>

        {/* Reuniones list */}
        <div className="max-w-xl mx-auto space-y-3">
          {(editMode ? draft.reuniones : current.reuniones).map((reunion, index) => (
            <Card
              key={reunion.id}
              className="hover:shadow-soft transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0">
                    {index + 1}
                  </div>

                  {editMode ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        className="font-bold text-base uppercase tracking-wide flex-1"
                        value={reunion.fecha}
                        placeholder="Ej: Domingo 25 de Enero"
                        onChange={e => updateFecha(reunion.id, e.target.value)}
                      />
                      <button
                        onClick={() => removeReunion(reunion.id)}
                        className="text-red-400 hover:text-red-500 transition-colors shrink-0"
                        title="Eliminar reunión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-foreground text-base uppercase tracking-wide">
                      {reunion.fecha}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add button */}
          {editMode && (
            <button
              onClick={addReunion}
              className="w-full py-3 border-2 border-dashed border-amber-500/30 rounded-lg text-amber-500 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar reunión
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
