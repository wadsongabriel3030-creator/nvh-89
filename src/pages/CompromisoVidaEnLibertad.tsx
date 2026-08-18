import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Flame, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { saveClassReport } from '@/lib/classReports';

const COMPROMISOS_LIBERTAD = [
  {
    id: 'compromiso-lib-1',
    texto:
      '1. Me comprometo a participar y equiparme durante las 13 semanas del curso Vida en Libertad, asistiendo puntualmente cada lunes.',
  },
  {
    id: 'compromiso-lib-2',
    texto:
      '2. Me comprometo a realizar con responsabilidad y excelencia cada una de las tareas e indicaciones que me sean asignadas durante la semana.',
  },
  {
    id: 'compromiso-lib-3',
    texto:
      '3. Me comprometo a ser instrumento y cumplir con la Gran Comisión de ir y formar a muchos discípulos.',
  },
  {
    id: 'compromiso-lib-4',
    texto:
      '4. Estoy enterado(a) y me comprometo a realizar el pago correspondiente al retiro que se llevará a cabo al finalizar las lecciones del curso Vida en Libertad.',
  },
  {
    id: 'compromiso-lib-5',
    texto:
      '5. Y sobre todo me comprometo a participar todo el tiempo con corazón dispuesto y comprometido.',
  },
];

export default function CompromisoVidaEnLibertad() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [declaracion, setDeclaracion] = useState(false);
  const [compromisos, setCompromisos] = useState<boolean[]>(
    COMPROMISOS_LIBERTAD.map(() => false)
  );
  const [submitted, setSubmitted] = useState(false);

  const toggleCompromiso = (idx: number) => {
    setCompromisos((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const allChecked = declaracion && compromisos.every(Boolean);
  const hasName = nombre.trim().length > 0 && apellido.trim().length > 0;

  const handleAcepto = async () => {
    if (!hasName) {
      toast.error('Por favor completa tu nombre y apellido.');
      return;
    }
    if (!allChecked) {
      toast.error('Debes marcar todas las casillas para poder aceptar el compromiso.');
      return;
    }

    try {
      await saveClassReport({
        area: 'compromiso-vida-en-libertad',
        leccion: 'Compromiso de Vida en Libertad',
        reportDate: new Date(fecha),
        leaderName: `${nombre} ${apellido}`,
        attendeeIds: [],
        attendeeNames: [`${nombre} ${apellido}`],
        extra: {
          nombre,
          apellido,
          fecha,
          declaracion,
          compromisos: COMPROMISOS_LIBERTAD.filter((_, i) => compromisos[i]).map((c) => c.texto),
        },
      });
    } catch {
      // still show success
    }

    setSubmitted(true);
    toast.success('¡Compromiso registrado con éxito!');
  };

  const handleNoAcepto = () => {
    toast.info('Esperamos que reconsideres tu compromiso con Vida en Libertad.');
    navigate('/curso-vida-libertad');
  };

  const handleReset = () => {
    setNombre('');
    setApellido('');
    setFecha(new Date().toISOString().split('T')[0]);
    setDeclaracion(false);
    setCompromisos(COMPROMISOS_LIBERTAD.map(() => false));
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
                Gracias <span className="font-semibold text-foreground">{nombre} {apellido}</span> por comprometerte con el Curso Vida en Libertad.
              </p>
              <p className="text-primary font-semibold text-lg mt-2">
                ¡Te esperamos cada lunes!
              </p>
              <div className="flex gap-3 mt-4 flex-wrap justify-center">
                <Button variant="outline" onClick={() => navigate('/curso-vida-libertad')}>
                  Volver al Curso
                </Button>
                <Button onClick={handleReset}>Nuevo Compromiso</Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Compromiso de Vida en Libertad
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Declara tu compromiso con el curso Vida en Libertad
              </p>
            </div>

            <div className="space-y-6">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre-lib">Nombre *</Label>
                  <Input
                    id="nombre-lib"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido-lib">Apellido *</Label>
                  <Input
                    id="apellido-lib"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha-lib">Fecha</Label>
                <Input
                  id="fecha-lib"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              {/* Declaración */}
              <div className="rounded-xl border border-orange-200/60 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-500/30 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="declaracion-lib"
                    checked={declaracion}
                    onCheckedChange={(v) => setDeclaracion(v === true)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="declaracion-lib"
                    className="text-base font-medium leading-relaxed cursor-pointer"
                  >
                    HOY decido comprometerme con el curso Vida en Libertad en Nuevos Hechos
                  </Label>
                </div>
              </div>

              {/* Compromisos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Como parte del Curso Vida en Libertad me comprometo a:
                </h3>

                <div className="space-y-3">
                  {COMPROMISOS_LIBERTAD.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border p-4 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={item.id}
                        checked={compromisos[idx]}
                        onCheckedChange={() => toggleCompromiso(idx)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={item.id} className="text-sm leading-relaxed cursor-pointer">
                        {item.texto}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleAcepto}
                  className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 text-white"
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
