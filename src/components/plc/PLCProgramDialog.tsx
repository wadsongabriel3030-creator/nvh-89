import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Snowflake,
  Music,
  Lightbulb,
  BookOpen,
  Gift,
  Heart,
  Megaphone,
  HandHeart,
} from 'lucide-react';

interface PLCProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const programItems = [
  {
    number: 1,
    title: 'Rompehielos',
    duration: '5 - 10 min',
    icon: Snowflake,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-500',
    description: 'Juego o dinámica para fomentar la interacción y la conexión.',
  },
  {
    number: 2,
    title: 'Adoración',
    duration: '10 min',
    icon: Music,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    description: 'Tiempo de alabanza y entrega a Dios.',
    details: ['2 Cantos, de preferencia los que se cantarán el próximo domingo.'],
  },
  {
    number: 3,
    title: 'Luz a la Comunidad / Mi Historia de la Semana',
    duration: '10 min',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
    description: '¿Cómo somos Luz a la Comunidad?',
    details: [
      'Testificando, compartiendo, orando y dando palabra en donde quiera que estemos.',
      'Compartir experiencias y testimonios sobre haber sido LUZ a la comunidad durante la semana.',
    ],
  },
  {
    number: 4,
    title: 'Lectura de la PALABRA (o lección)',
    duration: '20 min',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    description: 'Reflexión y lectura de la Biblia.',
    details: ['Aplicación práctica del mensaje en la vida diaria.'],
  },
  {
    number: 5,
    title: 'Ofrenda',
    duration: '5 min',
    icon: Gift,
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    description: 'Momento de dar con gratitud.',
  },
  {
    number: 6,
    title: 'Predicar al estilo J.E.S.Ú.S',
    duration: '5 min',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-500',
    description: 'Recordar 5 pasos e interceder',
    details: [
      '1. Orar - 2. Escuchar - 3. Comer - 4. Servir - 5. Compartir',
      'Orar por las personas para ganar y discipular.',
    ],
  },
  {
    number: 7,
    title: 'Anuncios',
    duration: '5 min',
    icon: Megaphone,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    description: 'Comunicaciones importantes y avisos de la iglesia.',
  },
  {
    number: 8,
    title: 'Oración y Ministración',
    duration: '10 min',
    icon: HandHeart,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-500',
    description: 'Presentar necesidades y dar gracias',
    details: ['Reportes: Compartir avances.'],
  },
];

export function PLCProgramDialog({ open, onOpenChange }: PLCProgramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            Programa PLC
          </DialogTitle>
          <p className="text-muted-foreground mt-1">
            Estructura del encuentro semanal
          </p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-4">
            {programItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="group relative rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex gap-4">
                    {/* Icon and Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-lg leading-tight">
                          <span className={`${item.textColor} font-bold mr-2`}>{item.number}.</span>
                          {item.title}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0 font-medium">
                          {item.duration}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-2">
                        {item.description}
                      </p>
                      
                      {item.details && (
                        <ul className="space-y-1 mt-2">
                          {item.details.map((detail, idx) => (
                            <li 
                              key={idx} 
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.bgColor.replace('/10', '')} mt-2 flex-shrink-0`} />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  {/* Connecting line */}
                  {index < programItems.length - 1 && (
                    <div className="absolute left-[2.25rem] top-full w-0.5 h-4 bg-gradient-to-b from-border to-transparent" />
                  )}
                </div>
              );
            })}
            
            {/* Total time summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Tiempo total estimado</span>
                <Badge className="bg-primary text-primary-foreground text-base px-4 py-1">
                  ~70 - 80 min
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
