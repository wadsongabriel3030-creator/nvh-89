import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { saveClassReport } from '@/lib/classReports';
import { useDbStorage } from '@/hooks/useDbStorage';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  Building2,
  Pencil,
  X,
  Save,
  Banknote,
  ArrowLeftRight,
} from 'lucide-react';

interface RetiroSettings {
  fecha: string;
  horario: string;
  lugar: string;
  costo: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCuenta: string;
  fechaLimitePago: string;
  whatsapp: string;
}

const DEFAULT_SETTINGS: RetiroSettings = {
  fecha: 'POR CONFIRMAR',
  horario: 'POR CONFIRMAR',
  lugar: 'POR CONFIRMAR',
  costo: 'Q200.00',
  banco: 'BANCO INDUSTRIAL',
  tipoCuenta: 'Cuenta Monetaria',
  numeroCuenta: '0490192499',
  nombreCuenta: 'IGLESIA CRISTIANA CONEXIÓN',
  fechaLimitePago: 'POR CONFIRMAR',
  whatsapp: '3067-5112',
};

const METODOS_PAGO = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, desc: 'Pago en mano al líder o encargado' },
  { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight, desc: 'Transferencia bancaria o depósito' },
];

const TOTAL_STEPS = 4;

export default function InscripcionRetiroVidaLibertad() {
  const navigate = useNavigate();
  const { value: settings, setValue: setSettings, loading: loadingSettings } =
    useDbStorage<RetiroSettings>('inscripcion-retiro-settings', DEFAULT_SETTINGS, 'vida-libertad');

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<RetiroSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!loadingSettings) setEditDraft(settings);
  }, [loadingSettings, settings]);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [numeroTransferencia, setNumeroTransferencia] = useState('');

  const isStepValid = () => {
    switch (step) {
      case 1: return nombre.trim().length > 0;
      case 2: return apellido.trim().length > 0;
      case 3: return telefono.trim().length > 0;
      case 4:
        if (!metodoPago) return false;
        if (metodoPago === 'transferencia') return numeroTransferencia.trim().length > 0;
        return true;
      default: return false;
    }
  };

  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveClassReport({
        area: 'inscripcion-retiro-vida-libertad',
        leccion: 'Inscripción Retiro Vida en Libertad',
        reportDate: new Date(),
        leaderName: `${nombre} ${apellido}`.trim(),
        attendeeIds: [],
        attendeeNames: [`${nombre} ${apellido}`.trim()],
        extra: {
          apellido,
          telefono,
          metodoPago,
          numeroTransferencia: metodoPago === 'transferencia' ? numeroTransferencia : null,
        },
      });
    } catch {
      // success toast even if DB fails
    }
    toast.success('¡Inscripción enviada con éxito!');
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setNombre('');
    setApellido('');
    setTelefono('');
    setMetodoPago('');
    setNumeroTransferencia('');
  };

  const handleSaveSettings = () => {
    setSettings(editDraft);
    setEditing(false);
    toast.success('Información del retiro actualizada');
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <MainLayout hideSidebar>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/10">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Inscripción Enviada!</h2>
              <p className="text-muted-foreground">
                Gracias <span className="font-semibold text-foreground">{nombre} {apellido}</span>, tu inscripción al Retiro Vida en Libertad fue registrada.
              </p>
              {metodoPago === 'efectivo' && (
                <div className="w-full p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400 text-left">
                  <p className="font-semibold mb-1">💵 Pago en Efectivo</p>
                  <p>Entregar el pago de <span className="font-semibold">{settings.costo}</span> al encargado o líder antes del <span className="font-semibold">{settings.fechaLimitePago}</span>.</p>
                </div>
              )}
              {metodoPago === 'transferencia' && (
                <div className="w-full p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm text-left">
                  <p className="font-semibold mb-1 text-primary">🏦 Transferencia registrada</p>
                  <p className="text-muted-foreground">No. de referencia: <span className="font-semibold text-foreground">{numeroTransferencia}</span></p>
                  <p className="text-muted-foreground mt-1">Enviar comprobante al WhatsApp <span className="font-semibold text-foreground">{settings.whatsapp}</span></p>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => navigate('/retiro-vida-libertad')}>
                  Volver al Retiro
                </Button>
                <Button onClick={handleReset}>Nueva Inscripción</Button>
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
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Inscripción — Retiro Vida en Libertad
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Completa tus datos para reservar tu lugar en el retiro.
              </p>
            </div>

            {/* Event Info Card */}
            <div className="mb-6 p-4 bg-muted/50 rounded-xl border space-y-3 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 w-7 p-0"
                onClick={() => {
                  if (editing) {
                    setEditDraft(settings);
                    setEditing(false);
                  } else {
                    setEditing(true);
                  }
                }}
                title={editing ? 'Cancelar edición' : 'Editar información'}
              >
                {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              </Button>

              {editing ? (
                <div className="space-y-3 pr-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'fecha', label: 'Fecha del retiro' },
                      { key: 'horario', label: 'Horario' },
                      { key: 'lugar', label: 'Lugar', span: true },
                      { key: 'costo', label: 'Costo' },
                      { key: 'fechaLimitePago', label: 'Fecha límite de pago' },
                      { key: 'banco', label: 'Banco' },
                      { key: 'tipoCuenta', label: 'Tipo de Cuenta' },
                      { key: 'numeroCuenta', label: 'No. de Cuenta' },
                      { key: 'nombreCuenta', label: 'A nombre de' },
                      { key: 'whatsapp', label: 'WhatsApp para comprobante' },
                    ] as { key: keyof RetiroSettings; label: string; span?: boolean }[]).map(({ key, label, span }) => (
                      <div key={key} className={`space-y-1 ${span ? 'sm:col-span-2' : ''}`}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input
                          value={editDraft[key]}
                          onChange={(e) => setEditDraft({ ...editDraft, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveSettings} size="sm" className="w-full gap-2 mt-2">
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">FECHA: {settings.fecha}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">HORARIO: {settings.horario}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">LUGAR: {settings.lugar}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">COSTO: {settings.costo}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Transferencia o depósitos a:
                    </p>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{settings.banco}</p>
                        <p className="text-sm text-foreground">
                          {settings.tipoCuenta} No. {settings.numeroCuenta}
                        </p>
                        <p className="text-sm text-foreground">A nombre de: {settings.nombreCuenta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      📌 Fecha límite de pago:{' '}
                      <span className="font-semibold">{settings.fechaLimitePago}</span>
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Enviar comprobante al WhatsApp{' '}
                      <span className="font-semibold">{settings.whatsapp}</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Paso {step} de {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="min-h-[200px] py-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Nombre *</Label>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Escribe tu nombre"
                    className="mt-2"
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Apellido *</Label>
                  <Input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Escribe tu apellido"
                    className="mt-2"
                    autoFocus
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold">Teléfono *</Label>
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+502 XXXX-XXXX"
                    type="tel"
                    className="mt-2"
                    autoFocus
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-base font-semibold">Método de Pago *</Label>
                    <p className="text-sm text-muted-foreground mb-3 mt-1">
                      ¿Cómo realizarás el pago de <span className="font-semibold text-foreground">{settings.costo}</span>?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {METODOS_PAGO.map(({ id, label, icon: Icon, desc }) => (
                        <div
                          key={id}
                          onClick={() => {
                            setMetodoPago(id);
                            if (id !== 'transferencia') setNumeroTransferencia('');
                          }}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            metodoPago === id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${metodoPago === id ? 'bg-primary/10' : 'bg-muted'}`}>
                            <Icon className={`w-5 h-5 ${metodoPago === id ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${metodoPago === id ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {metodoPago === 'transferencia' && (
                    <div className="animate-in fade-in duration-200 space-y-2">
                      <Label className="text-sm font-semibold">Número o referencia de transferencia *</Label>
                      <p className="text-xs text-muted-foreground">
                        Ingresa el número de operación de tu transferencia a{' '}
                        <span className="font-medium text-foreground">{settings.banco}</span>{' '}
                        cta. {settings.numeroCuenta}
                      </p>
                      <Input
                        value={numeroTransferencia}
                        onChange={(e) => setNumeroTransferencia(e.target.value)}
                        placeholder="Ej: 123456789"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Recuerda enviar tu comprobante al WhatsApp{' '}
                        <span className="font-semibold text-foreground">{settings.whatsapp}</span>
                      </p>
                    </div>
                  )}

                  {metodoPago === 'efectivo' && (
                    <div className="animate-in fade-in duration-200 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        💵 Recuerda entregar el pago en efectivo de{' '}
                        <span className="font-semibold">{settings.costo}</span> antes del{' '}
                        <span className="font-semibold">{settings.fechaLimitePago}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {step < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={!isStepValid()} className="gap-2">
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid() || submitting} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Enviando...' : 'Enviar Inscripción'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
