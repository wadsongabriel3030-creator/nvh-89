import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function InscripcionRetiroVidaLibertad() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSubmit = () => {
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos.', variant: 'destructive' });
      return;
    }
    toast({
      title: '¡Inscripción exitosa!',
      description: `${nombre} ${apellido}, te contactaremos cuando se confirme la fecha del retiro.`,
    });
    navigate('/retiro-vida-libertad');
  };

  return (
    <MainLayout hideSidebar>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <Button variant="ghost" onClick={() => navigate('/retiro-vida-libertad')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Inscripción - Retiro Vida en Libertad</h1>
            <p className="text-muted-foreground text-sm">
              Completa tus datos para inscribirte en el próximo retiro
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" />
            </div>

            <Button onClick={handleSubmit} className="w-full">Enviar</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
