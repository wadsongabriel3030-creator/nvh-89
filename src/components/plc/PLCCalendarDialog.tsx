import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Upload, FileText, Plus, Trash2, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { UploadPLCPdfDialog, downloadPLCPdf, PLCPdfFile } from './UploadPLCPdfDialog';
import { useDbStorage } from '@/hooks/useDbStorage';
import { useToast } from '@/hooks/use-toast';

export interface PLCActivity {
  id: string;
  day: string;
  date: string;
  activity: string;
  comments?: string;
}

interface PLCCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PLCCalendarDialog({ open, onOpenChange }: PLCCalendarDialogProps) {
  const { toast } = useToast();

  // Database storage for activities and PDFs
  const { value: activities, setValue: setActivities } = useDbStorage<PLCActivity[]>('plc_activities', [], 'plc');
  const { value: pdfFiles, setValue: setPdfFiles } = useDbStorage<PLCPdfFile[]>('plc_pdf_files', [], 'plc');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // New activity form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ day: '', date: '', activity: '', comments: '' });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the month to calculate empty cells
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getActivityForDate = (date: Date) => {
    return activities.find(a => isSameDay(new Date(a.date), date));
  };

  const getPdfsForDate = (date: Date) => {
    return pdfFiles.filter(p => isSameDay(new Date(p.activityDate), date));
  };

  const getActivitiesForMonth = () => {
    return activities.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate.getMonth() === currentMonth.getMonth() &&
             activityDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  // CRUD: Add activity
  const handleAddActivity = () => {
    if (!newActivity.date || !newActivity.activity.trim()) {
      toast({ title: 'Error', description: 'Fecha y actividad son obligatorios.', variant: 'destructive' });
      return;
    }
    const activity: PLCActivity = {
      id: Date.now().toString(),
      day: newActivity.day || getDayName(new Date(newActivity.date)),
      date: newActivity.date,
      activity: newActivity.activity.trim(),
      comments: newActivity.comments.trim() || undefined,
    };
    setActivities(prev => [...prev, activity].sort((a, b) => a.date.localeCompare(b.date)));
    setNewActivity({ day: '', date: '', activity: '', comments: '' });
    setShowAddForm(false);
    toast({ title: '¡Actividad creada!', description: `${activity.activity} — ${format(new Date(activity.date), "dd/MM/yyyy")}` });
  };

  // CRUD: Delete activity
  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    // Also remove associated PDFs
    setPdfFiles(prev => prev.filter(p => p.activityId !== id));
    toast({ title: 'Actividad eliminada' });
  };

  // PDF: Save
  const handleSavePdf = (pdf: PLCPdfFile) => {
    setPdfFiles(prev => [...prev, pdf]);
  };

  // PDF: Delete
  const handleDeletePdf = (pdfId: string) => {
    setPdfFiles(prev => prev.filter(p => p.id !== pdfId));
    toast({ title: 'PDF eliminado' });
  };

  const monthActivities = getActivitiesForMonth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Calendario PLC
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
                        <div key={pdf.id} className="mt-1 flex items-center gap-0.5 group">
                          <button
                            onClick={() => downloadPLCPdf(pdf)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer truncate flex-1 min-w-0"
                            title={pdf.name}
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{pdf.name}</span>
                          </button>
                          <button
                            onClick={() => handleDeletePdf(pdf.id)}
                            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title="Eliminar PDF"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => setShowAddForm(prev => !prev)}
                      title="Nueva actividad"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {/* Add activity form */}
                  {showAddForm && (
                    <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2">
                      <p className="text-sm font-medium text-amber-600">Nueva Actividad</p>
                      <div className="space-y-2">
                        <Input
                          type="date"
                          value={newActivity.date}
                          onChange={e => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Día (ej: Viernes - Sábado)"
                          value={newActivity.day}
                          onChange={e => setNewActivity(prev => ({ ...prev, day: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Actividad / Tema *"
                          value={newActivity.activity}
                          onChange={e => setNewActivity(prev => ({ ...prev, activity: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Comentarios (opcional)"
                          value={newActivity.comments}
                          onChange={e => setNewActivity(prev => ({ ...prev, comments: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewActivity({ day: '', date: '', activity: '', comments: '' }); }}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleAddActivity} className="gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  )}

                  {monthActivities.length === 0 && !showAddForm ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Ninguna actividad programada
                    </p>
                  ) : (
                    monthActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => handleDeleteActivity(activity.id)}
                            title="Eliminar actividad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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
                disabled={activities.length === 0}
              >
                <Upload className="w-4 h-4" />
                Subir PDF a Actividad
              </Button>
            </div>
          </Collapsible>
        </div>

        {/* Full Year Table */}
        {activities.length > 0 && (
          <Collapsible open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Cronograma Completo ({activities.length} actividades)</CardTitle>
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
                          <th className="px-3 py-2 text-right font-medium w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity, idx) => {
                          const date = new Date(activity.date);
                          const monthName = format(date, 'MMMM', { locale: es });
                          const prevActivity = activities[idx - 1];
                          const prevMonth = prevActivity ? format(new Date(prevActivity.date), 'MMMM', { locale: es }) : '';
                          const isNewMonth = monthName !== prevMonth;

                          return (
                            <>
                              {isNewMonth && (
                                <tr key={`month-${monthName}-${idx}`} className="bg-amber-100 dark:bg-amber-900/30">
                                  <td colSpan={5} className="px-3 py-2 font-bold uppercase text-amber-700 dark:text-amber-400">
                                    {monthName}
                                  </td>
                                </tr>
                              )}
                              <tr key={activity.id} className="border-b hover:bg-muted/50 group">
                                <td className="px-3 py-2">{activity.day}</td>
                                <td className="px-3 py-2">{format(date, 'dd/MM')}</td>
                                <td className="px-3 py-2 font-medium">{activity.activity}</td>
                                <td className="px-3 py-2 text-muted-foreground">{activity.comments || '-'}</td>
                                <td className="px-3 py-2 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteActivity(activity.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
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
        )}
      </DialogContent>

      <UploadPLCPdfDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        activities={activities}
        onSave={handleSavePdf}
      />
    </Dialog>
  );
}

function getDayName(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()] || '';
}
