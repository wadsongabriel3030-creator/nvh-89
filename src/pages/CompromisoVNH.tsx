import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CompromisoVNH() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [leidoFamilia, setLeidoFamilia] = useState(false);
  const [compromiso1, setCompromiso1] = useState(false);
  const [compromiso2, setCompromiso2] = useState(false);
  const [compromiso3, setCompromiso3] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allChecked = leidoFamilia && compromiso1 && compromiso2 && compromiso3;
  const hasName = nombre.trim().length > 0 && apellido.trim().length > 0;

  const handleAcepto = () => {
    if (!hasName) {
      toast.error('Por favor completa tu nombre y apellido.');
      return;
    }

    if (!allChecked) {
      toast.error('Debes marcar todas las casillas para poder aceptar el compromiso.');
      return;
    }

    setSubmitted(true);
  };

  const handleNoAcepto = () => {
    toast.info('Esperamos que reconsideres unirte a la familia Nuevos Hechos.');
    navigate('/membresia');
  };

  const handleReset = () => {
    setNombre('');
    setApellido('');
    setFecha(new Date().toISOString().split('T')[0]);
    setLeidoFamilia(false);
    setCompromiso1(false);
    setCompromiso2(false);
    setCompromiso3(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Compromiso Registrado!</h2>
              <p className="text-muted-foreground">
                Gracias {nombre} {apellido} por ser parte de la familia Nuevos Hechos.
              </p>
              <p className="text-primary font-semibold text-lg mt-2">
                Deseo dar el Siguiente paso en PASOS FIRMES Nuevos Hechos
              </p>
              <Button onClick={() => navigate('/inscripcion-primeros-pasos')} className="mt-4">
                Pasos Firmes
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Compromiso en Vida Nuevos Hechos
              </h1>
            </div>

            <div className="space-y-6">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              {/* Declaración de familia */}
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="leido-familia"
                    checked={leidoFamilia}
                    onCheckedChange={(v) => setLeidoFamilia(v === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="leido-familia" className="text-base font-medium leading-relaxed cursor-pointer">
                    HOY me hice parte de la familia Nuevos Hechos
                  </Label>
                </div>
              </div>

              {/* Compromisos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Como parte de la familia Nuevos Hechos me comprometo a:
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-card">
                    <Checkbox
                      id="compromiso-1"
                      checked={compromiso1}
                      onCheckedChange={(v) => setCompromiso1(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="compromiso-1" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-semibold">1.</span> A ser fiel, congregarme de forma regular a nuestras Reuniones dominicales.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-card">
                    <Checkbox
                      id="compromiso-2"
                      checked={compromiso2}
                      onCheckedChange={(v) => setCompromiso2(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="compromiso-2" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-semibold">2.</span> Ser parte activa de un PLC.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-card">
                    <Checkbox
                      id="compromiso-3"
                      checked={compromiso3}
                      onCheckedChange={(v) => setCompromiso3(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="compromiso-3" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-semibold">3.</span> Crecer Espiritualmente, a través de la Ruta del Discípulo. Iniciando con pasos firmes nuevos hechos …
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleAcepto}
                  className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Acepto
                </Button>
                <Button
                  onClick={handleNoAcepto}
                  variant="outline"
                  className="flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  size="lg"
                >
                  <XCircle className="w-5 h-5" />
                  No Acepto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
