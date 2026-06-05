import { MainLayout } from '@/components/layout/MainLayout';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const pasos = [
  {
    numero: 1,
    titulo: 'El Día Antes',
    descripcion:
      'Prepararnos con una Palabra revelada de parte de Dios. Orar por nombre, interceder y escuchar la Palabra, ya sea profética o versículo(s) revelado(s) de parte del Señor que sea(n) específicamente para la persona.',
  },
  {
    numero: 2,
    titulo: 'Darles la Palabra de parte de Dios',
    descripcion:
      'Iniciar compartiendo la palabra, mensaje y/o versículo(s) que Dios nos haya dado. Inmediatamente, tomar un tiempo para orar por la persona.',
  },
  {
    numero: 3,
    titulo: 'Seguimiento Espiritual',
    descripcion:
      'Hacer preguntas sobre su Caminar Espiritual: ¿Qué te ha hablado Dios esta semana?, ¿Cómo ha estado tu tiempo de oración, ayuno, Dar/Generosidad, servicio, etc.? (preguntar sobre disciplinas espirituales y otras enseñanzas)',
  },
  {
    numero: 4,
    titulo: 'Enseñanza',
    descripcion:
      'Impartir la enseñanza correspondiente, enfatizando el aprender a vivir la vida del nuevo reino. (Lección del Arrepentimiento, Disciplinas Espirituales, La Administración, La Familia o Freedom).',
  },
  {
    numero: 5,
    titulo: 'Orar con el Discípulo',
    descripcion: 'Asegurarse que el discípulo aprenda a orar.',
  },
];

const objetivos = [
  {
    titulo: 'Admitir',
    descripcion:
      'que el discípulo admita que es parte de la Historia de Dios, por lo que necesita reconciliarse con Dios y seguir a Jesús.',
  },
  {
    titulo: 'Comprometer',
    descripcion:
      'que el discípulo esté comprometido en su relación con Jesús y su propio crecimiento espiritual (aplicando las disciplinas espirituales).',
  },
  {
    titulo: 'Someter',
    descripcion:
      'que el discípulo aprenda a someter su vida entera a Dios, viviendo en obediencia radical, oración ferviente y rendición total.',
  },
  {
    titulo: 'Transmitir',
    descripcion:
      'el discípulo se convierte en un transmisor del mensaje de Jesús de tiempo completo y se multiplica en más discípulos de Jesús.',
  },
];

export default function GuiaReunionDiscipulado() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Guía de Mentor
              </h1>
              <p className="text-muted-foreground">
                Guía para cada reunión semanal que se tiene con el discípulo
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/discipleship')}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {pasos.map((paso, index) => (
            <Card
              key={paso.numero}
              className="hover:shadow-soft transition-all duration-300 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0 mt-0.5">
                    {paso.numero}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-base">
                      {paso.titulo}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Objetivo de Discipular */}
          <Card
            className="border-amber-500/30 bg-amber-500/5 animate-fade-in"
            style={{ animationDelay: `${pasos.length * 80}ms` }}
          >
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-foreground text-lg">
                Objetivo de Discipular
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                <span className="font-bold text-foreground">IMPORTANTE:</span>{' '}
                Al momento de ganar a una persona, debemos aprovechar el hambre
                que tienen por el Señor y nutrirle lo más posible.
              </p>
              <div className="space-y-3">
                {objetivos.map((obj, i) => (
                  <div key={obj.titulo} className="text-sm">
                    <span className="font-bold text-foreground">
                      {i + 1}. {obj.titulo}
                    </span>
                    <span className="text-muted-foreground">
                      {' - '}
                      {obj.descripcion}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
