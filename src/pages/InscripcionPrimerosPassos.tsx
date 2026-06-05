import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function InscripcionPrimerosPassos() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [acepto, setAcepto] = useState(false);
  const [conectarme, setConectarme] = useState(false);
  const [practica, setPractica] = useState(false);

  const handleSubmit = () => {
    if (!nombre.trim() || !apellido.trim() || !fecha) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos.', variant: 'destructive' });
      return;
    }
    if (!acepto || !conectarme || !practica) {
      toast({ title: 'Error', description: 'Debes marcar todas las casillas para continuar.', variant: 'destructive' });
      return;
    }
    toast({ title: '¡Registro exitoso!', description: `${nombre} ${apellido} ha dado el Primer Paso en Nuevos Hechos.` });
    navigate('/primeros-pasos');
  };

  return (
    <MainLayout hideSidebar>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <Button variant="ghost" onClick={() => navigate('/primeros-pasos')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">INSCRIPCIÓN - Pasos Firmes</h1>
            <p className="text-muted-foreground text-sm">Primer paso para crecer espiritualmente en Nuevos Hechos</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
            </div>
            <div className="space-y-2">
              <Label>Fecha de hoy</Label>
              <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <Checkbox id="acepto" checked={acepto} onCheckedChange={(v) => setAcepto(v === true)} className="mt-1" />
                <label htmlFor="acepto" className="text-sm leading-relaxed cursor-pointer">
                  HOY ACEPTO dar el <strong>PRIMER PASO</strong> para crecer espiritualmente en Nuevos Hechos.
                </label>
              </div>

              <p className="text-sm font-semibold text-foreground">Comprometiéndome a:</p>

              <div className="flex items-start gap-3">
                <Checkbox id="conectarme" checked={conectarme} onCheckedChange={(v) => setConectarme(v === true)} className="mt-1" />
                <label htmlFor="conectarme" className="text-sm leading-relaxed cursor-pointer">
                  A conectarme o asistir puntualmente a las clases.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="practica" checked={practica} onCheckedChange={(v) => setPractica(v === true)} className="mt-1" />
                <label htmlFor="practica" className="text-sm leading-relaxed cursor-pointer">
                  Y poner en práctica todo lo que esté aprendiendo.
                </label>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">Enviar</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
