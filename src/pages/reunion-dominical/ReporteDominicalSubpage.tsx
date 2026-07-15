import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClipboardList, Plus, Calendar, Clock, UserX, MessageSquare, Trash2, Eye, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useMembers } from '@/contexts/MembersContext';

interface ReporteSaved {
  id: string;
  fecha: string;
  liderId: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  servidores: number;
  visitantesPrimeraVez: number;
  totalAsistencia: number;
  regularesNoAsistieron: string[];
  testimonios: string;
}

function formatFecha(fecha: string) {
  try {
    return format(new Date(fecha), 'PPP', { locale: es });
  } catch {
    return fecha;
  }
}

export default function ReporteDominicalSubpage() {
  const { value: reportes, setValue: setReportes, loading } = useDbStorage<ReporteSaved[]>('reportes_dominicales', [], 'reunion-dominical');
  const { members } = useMembers();
  const [selectedReporte, setSelectedReporte] = useState<ReporteSaved | null>(null);

  const handleDelete = (id: string) => {
    setReportes((prev) => prev.filter((r) => r.id !== id));
    toast.success('Reporte eliminado');
  };

  const getMemberName = (id: string) => {
    const member = members.find((m) => m.id === id);
    return member ? `${member.firstName} ${member.lastName}` : id;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reporte Dominical</h1>
              <p className="text-muted-foreground">
                Resultados de los reportes de la reunión dominical ({reportes.length} registros)
              </p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link to="/reporte-dominical">
              <Plus className="w-4 h-4" />
              Nuevo Reporte
            </Link>
          </Button>
        </div>

        {/* Results */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando reportes...</p>
          </Card>
        ) : reportes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sin reportes aún</h3>
                <p className="text-muted-foreground mt-1">
                  Cree un nuevo reporte dominical para ver los resultados aquí.
                </p>
              </div>
              <Button asChild className="gap-2 mt-2">
                <Link to="/reporte-dominical">
                  <Plus className="w-4 h-4" />
                  Crear Primer Reporte
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reportes.map((reporte, index) => (
              <Card
                key={reporte.id}
                className="animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Date & Leader */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Calendar className="w-4 h-4" />
                        {formatFecha(reporte.fecha)}
                      </div>
                      <p className="text-sm text-muted-foreground">{reporte.liderId}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedReporte(reporte)}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(reporte.id)}
                        title="Eliminar reporte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{reporte.horaInicio} — {reporte.horaFin}</span>
                  </div>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Participantes</p>
                      <p className="text-lg font-bold text-foreground">{reporte.asistentes}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Servidores</p>
                      <p className="text-lg font-bold text-foreground">{reporte.servidores}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Primera Vez</p>
                      <p className="text-lg font-bold text-foreground">{reporte.visitantesPrimeraVez}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary">Total</p>
                      <p className="text-lg font-bold text-primary">{reporte.totalAsistencia}</p>
                    </div>
                  </div>

                  {/* Absent members - show count */}
                  {reporte.regularesNoAsistieron.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <UserX className="w-3.5 h-3.5" />
                        Ausentes ({reporte.regularesNoAsistieron.length})
                      </div>
                    </div>
                  )}

                  {/* Testimonies */}
                  {reporte.testimonios && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Testimonios
                      </div>
                      <p className="text-sm text-foreground bg-muted/30 rounded-md p-2.5 border border-border/50 line-clamp-3">
                        {reporte.testimonios}
                      </p>
                    </div>
                  )}

                  {/* Details button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setSelectedReporte(reporte)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedReporte} onOpenChange={(open) => !open && setSelectedReporte(null)}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Detalles del Reporte
            </DialogTitle>
          </DialogHeader>

          {selectedReporte && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-5">
                {/* Date & Leader */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                    <Calendar className="w-5 h-5" />
                    {formatFecha(selectedReporte.fecha)}
                  </div>
                  <p className="text-muted-foreground">{selectedReporte.liderId}</p>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Clock className="w-4 h-4" />
                  <span>Horario: {selectedReporte.horaInicio} — {selectedReporte.horaFin}</span>
                </div>

                {/* Attendance Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Asistencia
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Participantes</p>
                      <p className="text-xl font-bold text-foreground">{selectedReporte.asistentes}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Servidores</p>
                      <p className="text-xl font-bold text-foreground">{selectedReporte.servidores}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Primera Vez</p>
                      <p className="text-xl font-bold text-foreground">{selectedReporte.visitantesPrimeraVez}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium">Total</p>
                      <p className="text-xl font-bold text-primary">{selectedReporte.totalAsistencia}</p>
                    </div>
                  </div>
                </div>

                {/* Absent members - with NAMES */}
                {selectedReporte.regularesNoAsistieron.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <UserX className="w-4 h-4 text-orange-500" />
                      Ausentes ({selectedReporte.regularesNoAsistieron.length})
                    </h3>
                    <div className="space-y-1.5">
                      {selectedReporte.regularesNoAsistieron.map((id, idx) => (
                        <div
                          key={id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15"
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/15 text-orange-500 text-xs font-semibold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-foreground">{getMemberName(id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonies */}
                {selectedReporte.testimonios && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Testimonios
                    </h3>
                    <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 border border-border/50 whitespace-pre-wrap">
                      {selectedReporte.testimonios}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
