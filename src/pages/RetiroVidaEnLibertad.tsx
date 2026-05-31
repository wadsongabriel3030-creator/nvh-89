import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin, Clock, UserPlus, Info } from 'lucide-react';
import { VidaLibertadActions } from '@/components/vida-libertad/VidaLibertadActions';

export default function RetiroVidaEnLibertad() {
  const navigate = useNavigate();

  // Información del próximo retiro (cuando se confirme la fecha, actualizar aquí)
  const retiro = {
    fechaConfirmada: false,
    fecha: '', // ej: '2026-06-12'
    horario: '',
    lugar: '',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retiro Vida en Libertad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Un tiempo apartado para experimentar libertad y restauración
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Próximo Retiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {retiro.fechaConfirmada ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Fecha:</span>
                  <span className="text-muted-foreground">{retiro.fecha}</span>
                </div>
                {retiro.horario && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Horario:</span>
                    <span className="text-muted-foreground">{retiro.horario}</span>
                  </div>
                )}
                {retiro.lugar && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Lugar:</span>
                    <span className="text-muted-foreground">{retiro.lugar}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Fecha por confirmar</p>
                  <p className="text-muted-foreground mt-1">
                    Aún no hay una fecha confirmada para el próximo Retiro Vida en Libertad.
                    Inscríbete y te notificaremos en cuanto se anuncie la fecha oficial.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={() => navigate('/inscripcion-retiro-vida-libertad')}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              <UserPlus className="w-4 h-4" />
              INSCRÍBETE
            </Button>

            <div className="pt-4 border-t border-border">
              <VidaLibertadActions groupName="Retiro Vida en Libertad" storageKey="retiro-vida-libertad" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
