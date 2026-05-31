import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookMarked, Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Versiculo {
  id: string;
  referencia: string;
  texto: string;
  observaciones?: string;
  createdAt: string;
}

const STORAGE_KEY = 'versiculos-reunion-dominical';

export default function Versiculos() {
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [referencia, setReferencia] = useState('');
  const [texto, setTexto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVersiculos(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (list: Versiculo[]) => {
    setVersiculos(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const resetForm = () => {
    setReferencia('');
    setTexto('');
    setObservaciones('');
    setShowForm(false);
  };

  const handleSave = () => {
    if (!referencia.trim() || !texto.trim()) {
      toast({ title: 'Completa los campos requeridos', description: 'Referencia y Texto son obligatorios.', variant: 'destructive' });
      return;
    }
    const nuevo: Versiculo = {
      id: Date.now().toString(),
      referencia: referencia.trim(),
      texto: texto.trim(),
      observaciones: observaciones.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    persist([nuevo, ...versiculos]);
    toast({ title: 'Versículo agregado', description: nuevo.referencia });
    resetForm();
  };

  const handleDelete = (id: string) => {
    persist(versiculos.filter((v) => v.id !== id));
    toast({ title: 'Versículo eliminado' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookMarked className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Versículos</h1>
              <p className="text-muted-foreground">Versículos bíblicos para la reunión dominical</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setShowForm((s) => !s)}>
            <Plus className="w-4 h-4" />
            Nuevo Versículo
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Agregar Versículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia *</Label>
                <Input
                  id="referencia"
                  placeholder="Ej: Juan 3:16"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="texto">Texto del Versículo *</Label>
                <Textarea
                  id="texto"
                  placeholder="Escribe el texto del versículo..."
                  rows={4}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas, contexto, aplicación..."
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {versiculos.length > 0 ? (
          <div className="space-y-4">
            {versiculos.map((v) => (
              <Card key={v.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <CardTitle className="text-lg text-primary">{v.referencia}</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(v.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground leading-relaxed italic">"{v.texto}"</p>
                  {v.observaciones && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.observaciones}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <BookMarked className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sin versículos aún</h3>
              <p className="text-muted-foreground mt-1">Agrega versículos para compartir en la reunión.</p>
            </div>
          </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
