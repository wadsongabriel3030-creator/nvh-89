import { MainLayout } from '@/components/layout/MainLayout';
import { MessageCircle, Megaphone, Heart, Home, Ban, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SECCIONES = [
  {
    id: 'intro',
    titulo: 'Introducción',
    icon: Quote,
    descripcion:
      'Frases con las cuales siempre queremos contribuir a la vida de los miembros de Nuevos Hechos. Para indicar tiempo de orar y ministrar unos por otros:',
    frases: [
      'Aprendernos los nombres.',
      'Amados.',
      'Cuando se mencione: "Comunidad" en el momento de la ministración es momento de orar unos por los otros.',
    ],
  },
  {
    id: 'anuncios',
    titulo: 'Para Anuncios (visión, identidad, misión)',
    icon: Megaphone,
    frases: [
      'Un lugar donde la historia de Dios cobra vida y cada vida se convierte en la historia de Dios.',
      'Somos una gran familia obediente a Dios, dispuestos a que todos Lo conozcan.',
      'Nuestras familias son parte de la Historia de Dios.',
      'Avanzamos juntos el Reino de Dios con un corazón generoso. (Ofrenda)',
      'Nosotros no pedimos ofrenda, presentamos ofrenda al Señor.',
    ],
  },
  {
    id: 'ministracion',
    titulo: 'Para Ministración en Servicio (adoración, ministración)',
    icon: Heart,
    frases: [
      'Aquí somos adoradores apasionados que viven entregados a Jesús.',
      'Oramos con Fe, porque sabemos que Dios es grande y todopoderoso.',
      'Venimos a ministrar el corazón de Dios. (Para la Adoración)',
      'Creemos que Dios nos formó para tener comunidad, un lugar donde nos ministramos unos a otros.',
      'Comunidad. (Cada vez que se menciona comunidad durante la ministración vamos a orar los unos por los otros)',
    ],
  },
  {
    id: 'plc',
    titulo: 'Para PLC (Por Las Casas)',
    icon: Home,
    frases: [
      'Donde estemos, transformamos entornos por el poder del Espíritu Santo.',
      'Llevamos a Jesús de casa en casa.',
      'Vivimos en misión: ser discípulos que hacen discípulos.',
    ],
  },
];

const NO_DECIR = ['Vamos a "dar" nuestras ofrendas o vamos a pedir.'];

export default function FrasesInstitucionales() {
  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Frases Institucionales</h1>
            <p className="text-muted-foreground">
              Cultura Nuevos Hechos — frases para usar en la reunión dominical
            </p>
          </div>
        </div>

        {SECCIONES.map((seccion) => {
          const Icon = seccion.icon;
          return (
            <Card key={seccion.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{seccion.titulo}</CardTitle>
                    {seccion.descripcion && (
                      <p className="text-sm text-muted-foreground">{seccion.descripcion}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {seccion.frases.map((frase, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/60"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-semibold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-foreground leading-relaxed">{frase}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-destructive/40">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <CardTitle className="text-lg text-destructive">Qué no decir</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {NO_DECIR.map((frase, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <Ban className="w-4 h-4 text-destructive mt-1 shrink-0" />
                  <p className="text-foreground leading-relaxed">{frase}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
