import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { VidaLibertadActions } from '@/components/vida-libertad/VidaLibertadActions';

export default function CursoVidaEnLibertad() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Curso Vida en Libertad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Curso para crecer en libertad espiritual en Nuevos Hechos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Información del Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-sm">
              Próximamente más información sobre el Curso Vida en Libertad.
            </p>
            <VidaLibertadActions groupName="Curso Vida en Libertad" storageKey="curso-vida-libertad" />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
