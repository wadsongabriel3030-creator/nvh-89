import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Upload, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { UploadPLCPdfDialog, getPLCPdfFiles, downloadPLCPdf, PLCPdfFile } from './UploadPLCPdfDialog';
export interface PLCActivity {
  id: string;
  day: string;
  date: string;
  activity: string;
  comments?: string;
}

const plcActivities2026: PLCActivity[] = [
  // Janeiro
  { id: '1', day: 'Viernes - Sábado', date: '2026-01-09', activity: '1 Juan - capítulo 1', comments: 'Reunión por ZOOM' },
  { id: '2', day: 'Viernes', date: '2026-01-16', activity: 'Noche de Libertad y Regalos', comments: 'Reunión presencial / pausa en PLC' },
  { id: '3', day: 'Viernes - Sábado', date: '2026-01-23', activity: '1 Juan - capítulo 2' },
  { id: '4', day: 'Viernes - Sábado', date: '2026-01-30', activity: '1 Juan - capítulo 3' },
  // Febrero
  { id: '5', day: 'Viernes - Sábado', date: '2026-02-06', activity: '1 Juan - capítulo 4' },
  { id: '6', day: 'Viernes - Sábado', date: '2026-02-13', activity: '1 Juan - capítulo 5' },
  { id: '7', day: 'Viernes - Sábado', date: '2026-02-20', activity: 'Salida de Esperanza' },
  { id: '8', day: 'Viernes - Sábado', date: '2026-02-27', activity: '2 Juan - capítulo 1' },
  // Marzo
  { id: '9', day: 'Viernes - Sábado', date: '2026-03-06', activity: '3 Juan - capítulo 1' },
  { id: '10', day: 'Viernes - Sábado', date: '2026-03-13', activity: 'Judas - capítulo 1' },
  { id: '11', day: 'Viernes', date: '2026-03-20', activity: 'Noche de Adoración', comments: 'Reunión presencial / pausa en PLC' },
  { id: '12', day: 'Viernes - Sábado', date: '2026-03-27', activity: '-' },
  // Abril
  { id: '13', day: 'Viernes - Sábado', date: '2026-04-03', activity: 'Apocalipsis - capítulo 1' },
  { id: '14', day: 'Viernes - Sábado', date: '2026-04-10', activity: 'Apocalipsis - capítulo 2' },
  { id: '15', day: 'Viernes - Sábado', date: '2026-04-17', activity: 'Apocalipsis - capítulo 3' },
  { id: '16', day: 'Viernes - Sábado', date: '2026-04-24', activity: 'Apocalipsis - capítulo 4' },
  // Mayo
  { id: '17', day: 'Viernes - Sábado', date: '2026-05-01', activity: 'Apocalipsis - capítulo 5' },
  { id: '18', day: 'Viernes - Sábado', date: '2026-05-08', activity: 'Apocalipsis - capítulo 6' },
  { id: '19', day: 'Viernes - Sábado', date: '2026-05-15', activity: 'Apocalipsis - capítulo 7' },
  { id: '20', day: 'Viernes - Sábado', date: '2026-05-22', activity: 'Apocalipsis - capítulo 8' },
  { id: '21', day: 'Viernes - Sábado', date: '2026-05-29', activity: 'Apocalipsis - capítulo 9' },
  // Junio
  { id: '22', day: 'Viernes - Sábado', date: '2026-06-05', activity: 'Apocalipsis - capítulo 10' },
  { id: '23', day: 'Viernes - Sábado', date: '2026-06-12', activity: 'Apocalipsis - capítulo 11' },
  { id: '24', day: 'Viernes - Sábado', date: '2026-06-19', activity: 'Apocalipsis - capítulo 12' },
  { id: '25', day: 'Viernes - Sábado', date: '2026-06-26', activity: 'Apocalipsis - capítulo 13' },
  // Julio
  { id: '26', day: 'Viernes - Sábado', date: '2026-07-03', activity: 'Apocalipsis - capítulo 14' },
  { id: '27', day: 'Viernes - Sábado', date: '2026-07-10', activity: 'Apocalipsis - capítulo 15' },
  { id: '28', day: 'Viernes - Sábado', date: '2026-07-17', activity: 'Apocalipsis - capítulo 16' },
  { id: '29', day: 'Viernes - Sábado', date: '2026-07-24', activity: 'Apocalipsis - capítulo 17' },
  { id: '30', day: 'Viernes - Sábado', date: '2026-07-31', activity: 'Apocalipsis - capítulo 18' },
  // Agosto
  { id: '31', day: 'Viernes - Sábado', date: '2026-08-07', activity: 'Apocalipsis - capítulo 19' },
  { id: '32', day: 'Viernes - Sábado', date: '2026-08-14', activity: 'Apocalipsis - capítulo 20' },
  { id: '33', day: 'Viernes - Sábado', date: '2026-08-21', activity: 'Apocalipsis - capítulo 21' },
  { id: '34', day: 'Viernes - Sábado', date: '2026-08-28', activity: 'Apocalipsis - capítulo 22' },
  // Septiembre
  { id: '35', day: 'Viernes - Sábado', date: '2026-09-04', activity: 'Romanos - capítulo 1' },
  { id: '36', day: 'Viernes - Sábado', date: '2026-09-11', activity: 'Romanos - capítulo 2' },
  { id: '37', day: 'Viernes - Sábado', date: '2026-09-18', activity: 'Romanos - capítulo 3' },
  { id: '38', day: 'Viernes - Sábado', date: '2026-09-25', activity: 'Romanos - capítulo 4' },
  // Octubre
  { id: '39', day: 'Viernes - Sábado', date: '2026-10-02', activity: 'Romanos - capítulo 5' },
  { id: '40', day: 'Viernes - Sábado', date: '2026-10-09', activity: 'Romanos - capítulo 6' },
  { id: '41', day: 'Viernes - Sábado', date: '2026-10-16', activity: 'Romanos - capítulo 7' },
  { id: '42', day: 'Viernes - Sábado', date: '2026-10-23', activity: 'Romanos - capítulo 8' },
  { id: '43', day: 'Viernes - Sábado', date: '2026-10-30', activity: 'Romanos - capítulo 9' },
  // Noviembre
  { id: '44', day: 'Viernes - Sábado', date: '2026-11-06', activity: 'Romanos - capítulo 10' },
  { id: '45', day: 'Viernes - Sábado', date: '2026-11-13', activity: 'Romanos - capítulo 11' },
  { id: '46', day: 'Viernes - Sábado', date: '2026-11-20', activity: 'Romanos - capítulo 12' },
  { id: '47', day: 'Viernes - Sábado', date: '2026-11-27', activity: 'Romanos - capítulo 13' },
  // Diciembre
  { id: '48', day: 'Viernes - Sábado', date: '2026-12-04', activity: 'Romanos - capítulo 14' },
  { id: '49', day: 'Viernes - Sábado', date: '2026-12-11', activity: 'Romanos - capítulo 15' },
  { id: '50', day: 'Viernes - Sábado', date: '2026-12-18', activity: 'Romanos - capítulo 16' },
];

interface PLCCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PLCCalendarDialog({ open, onOpenChange }: PLCCalendarDialogProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<PLCPdfFile[]>(getPLCPdfFiles());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the month to calculate empty cells
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getActivityForDate = (date: Date) => {
    return plcActivities2026.find(a => isSameDay(new Date(a.date), date));
  };

  const getPdfsForDate = (date: Date) => {
    return pdfFiles.filter(p => isSameDay(new Date(p.activityDate), date));
  };

  const getActivitiesForMonth = () => {
    return plcActivities2026.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate.getMonth() === currentMonth.getMonth() && 
             activityDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const handlePdfUploaded = useCallback(() => {
    setPdfFiles(getPLCPdfFiles());
  }, []);

  const monthActivities = getActivitiesForMonth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Calendario PLC 2026
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, idx) => (
                  <div key={`empty-${idx}`} className="min-h-[80px] p-2 rounded-lg" />
                ))}
                {days.map((day, idx) => {
                  const activity = getActivityForDate(day);
                  const dayPdfs = getPdfsForDate(day);
                  const isFriday = day.getDay() === 5;
                  return (
                    <div
                      key={idx}
                      className={`
                        min-h-[80px] p-2 rounded-lg border text-left transition-colors
                        ${activity ? 'bg-amber-500/10 border-amber-500/30' : 'hover:bg-muted'}
                        ${isFriday ? 'bg-amber-500/5' : ''}
                      `}
                    >
                      <span className={`text-sm font-medium ${activity ? 'text-amber-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {activity && (
                        <div className="mt-1">
                          <div className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded truncate">
                            {activity.activity}
                          </div>
                        </div>
                      )}
                      {dayPdfs.map(pdf => (
                        <button
                          key={pdf.id}
                          onClick={() => downloadPLCPdf(pdf)}
                          className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer truncate w-full"
                          title={pdf.name}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pdf.name}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity List for Month */}
          <Collapsible open={activitiesOpen} onOpenChange={setActivitiesOpen}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                      {monthActivities.length}
                    </Badge>
                    Actividades del Mes
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {monthActivities.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Ninguna actividad programada
                    </p>
                  ) : (
                    monthActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{activity.activity}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(activity.date), "dd 'de' MMMM", { locale: es })} • {activity.day}
                            </p>
                            {activity.comments && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {activity.comments}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>

            {/* Upload PDF Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Subir PDF a Actividad
              </Button>
            </div>
          </Collapsible>
        </div>

        {/* Full Year Table */}
        <Collapsible open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cronograma Anual PLC 2026</CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${scheduleOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-500 text-white">
                        <th className="px-3 py-2 text-left font-medium">Día</th>
                        <th className="px-3 py-2 text-left font-medium">Fecha</th>
                        <th className="px-3 py-2 text-left font-medium">Actividad / Tema</th>
                        <th className="px-3 py-2 text-left font-medium">Comentarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plcActivities2026.map((activity, idx) => {
                        const date = new Date(activity.date);
                        const monthName = format(date, 'MMMM', { locale: es });
                        const prevActivity = plcActivities2026[idx - 1];
                        const prevMonth = prevActivity ? format(new Date(prevActivity.date), 'MMMM', { locale: es }) : '';
                        const isNewMonth = monthName !== prevMonth;

                        return (
                          <>
                            {isNewMonth && (
                              <tr key={`month-${monthName}`} className="bg-amber-100 dark:bg-amber-900/30">
                                <td colSpan={4} className="px-3 py-2 font-bold uppercase text-amber-700 dark:text-amber-400">
                                  {monthName}
                                </td>
                              </tr>
                            )}
                            <tr key={activity.id} className="border-b hover:bg-muted/50">
                              <td className="px-3 py-2">{activity.day}</td>
                              <td className="px-3 py-2">{format(date, 'dd/MM')}</td>
                              <td className="px-3 py-2 font-medium">{activity.activity}</td>
                              <td className="px-3 py-2 text-muted-foreground">{activity.comments || '-'}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </DialogContent>

      <UploadPLCPdfDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        activities={plcActivities2026}
        onUploaded={handlePdfUploaded}
      />
    </Dialog>
  );
}
