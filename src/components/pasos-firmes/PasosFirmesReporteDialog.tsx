import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMembers } from '@/contexts/MembersContext';
import { toast } from 'sonner';

export interface CursoPasosFirmes {
  id: string;
  nombre: string;
  lecciones: string[];
  color: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  curso: CursoPasosFirmes | null;
}

export function PasosFirmesReporteDialog({ open, onOpenChange, curso }: Props) {
  const { members } = useMembers();
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [quienDio, setQuienDio] = useState('');
  const [leccion, setLeccion] = useState('');
  const [asistentes, setAsistentes] = useState<string[]>([]);
  const [invitados, setInvitados] = useState('');
  const [decisiones, setDecisiones] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const reset = () => {
    setFecha(new Date());
    setQuienDio('');
    setLeccion('');
    setAsistentes([]);
    setInvitados('');
    setDecisiones('');
    setObservaciones('');
  };

  const toggleMember = (id: string) => {
    setAsistentes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!fecha || !quienDio || !leccion) {
      toast.error('Complete fecha, quien dio la clase y lección');
      return;
    }
    toast.success(`Reporte de "${curso?.nombre}" enviado con éxito`);
    reset();
    onOpenChange(false);
  };

  if (!curso) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Reporte – {curso.nombre}</DialogTitle>
          <DialogDescription>Complete la información de la clase</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-2">
            <div className="space-y-2">
              <Label>Fecha de la clase *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !fecha && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fecha} onSelect={setFecha} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>¿Quién dio la clase? *</Label>
              <Input
                value={quienDio}
                onChange={(e) => setQuienDio(e.target.value)}
                placeholder="Nombre del instructor"
              />
            </div>

            <div className="space-y-2">
              <Label>Lección impartida *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {curso.lecciones.map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={leccion === l ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeccion(l)}
                    className="justify-start text-left h-auto py-2 whitespace-normal"
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Miembros asistentes ({asistentes.length})</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
                {members.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">No hay miembros registrados</p>
                )}
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={asistentes.includes(m.id)}
                      onCheckedChange={() => toggleMember(m.id)}
                    />
                    <span className="text-sm">{m.firstName} {m.lastName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Invitados</Label>
              <Textarea
                value={invitados}
                onChange={(e) => setInvitados(e.target.value)}
                placeholder="Nombres de invitados (separados por coma)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Decisiones / Testimonios</Label>
              <Textarea
                value={decisiones}
                onChange={(e) => setDecisiones(e.target.value)}
                placeholder="Decisiones tomadas o testimonios compartidos"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Comentarios adicionales"
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="w-4 h-4" />
            Enviar reporte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
