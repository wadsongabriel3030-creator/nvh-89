import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const reuniones = [
  { numero: 1, fecha: 'Domingo 25 de Enero' },
  { numero: 2, fecha: 'Domingo 15 de Marzo' },
  { numero: 3, fecha: 'Domingo 24 de Mayo' },
  { numero: 4, fecha: 'Domingo 19 de Julio' },
  { numero: 5, fecha: 'Domingo 13 de Septiembre' },
  { numero: 6, fecha: 'Domingo 29 de Noviembre' },
];

export default function ReunionesDiscipuladores() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reuniones Discipuladores</h1>
              <p className="text-muted-foreground">
                Calendario de reuniones para discipuladores
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/discipleship')}>
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        <div className="max-w-xl mx-auto space-y-3">
          {reuniones.map((reunion, index) => (
            <Card
              key={reunion.numero}
              className="hover:shadow-soft transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0">
                    {reunion.numero}
                  </div>
                  <span className="font-bold text-foreground text-base uppercase tracking-wide">
                    {reunion.fecha}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
