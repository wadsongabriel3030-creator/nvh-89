import { MainLayout } from '@/components/layout/MainLayout';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProcesoDiscipular() {
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
                Proceso de Discipular
              </h1>
              <p className="text-muted-foreground">
                El objetivo principal es <span className="font-bold">Abrir los ojos</span> de la persona para que cambie de reino, aprenda a caminar en intimidad con Dios y a vivir la vida del nuevo reino y compartir la vida del reino. <span className="italic">(Hechos 26:18)</span>
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

        <div className="max-w-2xl mx-auto space-y-5">
          {/* PASO 1 */}
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-amber-500/30 mt-1" />
              </div>
              <Card className="flex-1 animate-fade-in">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">
                    Abrirle Los Ojos / Recibir al Señor
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-bold text-foreground">TU MISIÓN SERÁ</span>
                    </p>
                    <p>
                      Abrirle los ojos para que pasen del reino de las tinieblas al reino de la luz. Ora, busca y comparte.
                    </p>

                    <div className="space-y-2 mt-3">
                      <p className="font-bold text-foreground">
                        A. Abre sus Ojos - A través de una de las siguientes Herramientas:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Compartir La Historia De Dios,</li>
                        <li>Compartir tu Testimonio Personal</li>
                        <li>Evangelismo Profético.</li>
                      </ul>
                      <p className="font-bold text-foreground">
                        Inmediatamente - 2 o 3 días después proceder con parte B
                      </p>
                    </div>

                    <div className="space-y-2 mt-3">
                      <p className="font-bold text-foreground">
                        B. Reconciliación - La persona debe recibir el restablecimiento de su relación con Dios.
                      </p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          Dar <span className="italic">Lección de Arrepentimiento</span>. Que haya un entendimiento para una metanoia.
                        </li>
                        <li>
                          Guiar a la persona a la confesión de sus pecados y asegurarse que reciba a Jesús como Señor y Salvador.
                        </li>
                        <li>
                          Invitar a la persona a convertirse en discípulo de Jesús.
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* PASO 2 */}
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-amber-500/30 mt-1" />
              </div>
              <Card className="flex-1 animate-fade-in" style={{ animationDelay: '80ms' }}>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-bold text-foreground text-lg">
                    Enseñar la Vida del Reino de Dios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compartir la lección que le ayudará en su proceso de crecimiento y cambio de vida. <span className="italic">(Ver Programa y Objetivos Para Discipulados)</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">IMPORTANTE:</span> Asegurarse que la persona esté dispuesta a ser enseñada, <span className="font-bold">preguntar: ¿Estás dispuesto a que te discipule para crecer?</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sub-pasos A y B */}
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-0.5 flex-1 bg-amber-500/30" />
              </div>
              <div className="flex-1 space-y-3">
                <Card className="animate-fade-in" style={{ animationDelay: '160ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        A
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Devocional Personal</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Compartir como hacer un devocional personal: alabanza, oración, valor espiritual, respuesta a Dios y plan bíblico (ver lección de Devocionales)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in" style={{ animationDelay: '240ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        B
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Disciplinas Espirituales</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprender y aplicar <span className="font-bold">Disciplinas Espirituales.</span> Hacer las 10 lecciones juntamente con ellos. Incluir introducción y Epílogo.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in" style={{ animationDelay: '320ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        C.1
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Administración</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-bold text-foreground">Nota:</span> Idealmente continuar con <span className="font-bold">la Administración</span> pero si fuere necesario por las circunstancias particulares, se inicia con La Familia Cristiana. Dar las lecciones incluyendo Introducción y Conclusión si es el caso. Aprender sobre cómo manejar responsable y sabiamente los recursos de Dios.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        C.2
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Familia Cristiana</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprender los roles y responsabilidades de la familia cristiana.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-bold text-foreground">Nota:</span> Continuar con la Familia Cristiana o Administración si fuese el caso. Dar todas las lecciones incluyendo Introducción y Conclusión, si corresponde.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in" style={{ animationDelay: '480ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        D
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Ciclo Freedom</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Durante el ciclo de Freedom se pausan las otras lecciones y se usa esto para el discipulado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in" style={{ animationDelay: '560ms' }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm shrink-0">
                        E
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Creencias Básicas</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprender las creencias básicas del reino de Dios, los cimiento de la Fe cristiana. Enseñar las 10 lecciones de las Creencias Básicas.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 font-bold">
                          NOTA: este curso se ofrecerá institucionalmente, buscar horarios y ubicación.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* PASO 3 */}
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg shrink-0">
                  3
                </div>
              </div>
              <Card className="flex-1 animate-fade-in" style={{ animationDelay: '640ms' }}>
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground text-lg">
                    Compartir con OTROS sobre el Reino
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    El discípulo comparte con familia y amigos sobre el Reino de Dios e inicia el proceso como discipulador de estas personas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
