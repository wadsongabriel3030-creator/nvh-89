import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMembers } from '@/contexts/MembersContext';
import { toast } from '@/hooks/use-toast';

export function ReporteDominicalCard() {
  const { members } = useMembers();
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [liderId, setLiderId] = useState<string>('');
  const [asistentes, setAsistentes] = useState<string>('');
  const [regularesNoAsistieron, setRegularesNoAsistieron] = useState<string>('');
  const [servidores, setServidores] = useState<string>('');

  const lideres = members.filter(
    (m) => m.role === 'leader' || m.role === 'pastor' || m.role === 'admin'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !liderId) {
      toast({
        title: 'Complete los campos',
        description: 'Fecha y líder a cargo son obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    const lider = members.find((m) => m.id === liderId);
    toast({
      title: '¡Reporte dominical guardado!',
      description: `${format(fecha, "PPP", { locale: es })} · Líder: ${lider?.firstName} ${lider?.lastName}`,
    });
    setAsistentes('');
    setRegularesNoAsistieron('');
    setServidores('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Reporte Dominical</CardTitle>
            <CardDescription>Registre la información de la reunión dominical</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de Reunión */}
          <div className="flex flex-col gap-2">
            <Label>Fecha de Reunión</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !fecha && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha ? format(fecha, 'PPP', { locale: es }) : <span>Seleccione una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Líder a cargo */}
          <div className="flex flex-col gap-2">
            <Label>Nombre de Líder a cargo</Label>
            <Select value={liderId} onValueChange={setLiderId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un líder" />
              </SelectTrigger>
              <SelectContent>
                {lideres.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No hay líderes registrados
                  </SelectItem>
                ) : (
                  lideres.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.firstName} {l.lastName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Número de Asistentes aproximado */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="asistentes">Número de Asistentes aproximado</Label>
            <Input
              id="asistentes"
              type="number"
              min={0}
              placeholder="Ej: 120"
              value={asistentes}
              onChange={(e) => setAsistentes(e.target.value)}
            />
          </div>

          {/* Personas regulares que no asistieron */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="regulares">Personas regulares que no asistieron</Label>
            <Input
              id="regulares"
              type="number"
              min={0}
              placeholder="Ej: 10"
              value={regularesNoAsistieron}
              onChange={(e) => setRegularesNoAsistieron(e.target.value)}
            />
          </div>

          {/* Número de servidores */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="servidores">Número de servidores</Label>
            <Input
              id="servidores"
              type="number"
              min={0}
              placeholder="Ej: 15"
              value={servidores}
              onChange={(e) => setServidores(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Guardar Reporte</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
