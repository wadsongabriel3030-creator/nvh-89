import { useState } from 'react';
import { useDbStorage } from '@/hooks/useDbStorage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarActivity, ActivityType } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const activityTypes: { value: ActivityType; label: string; color: string }[] = [
  { value: 'culto', label: 'Culto', color: 'bg-blue-500' },
  { value: 'evento', label: 'Evento', color: 'bg-purple-500' },
  { value: 'jejum', label: 'Jejum', color: 'bg-orange-500' },
  { value: 'oracao', label: 'Oração', color: 'bg-green-500' },
  { value: 'treinamento', label: 'Treinamento', color: 'bg-yellow-500' },
  { value: 'reuniao', label: 'Reunião', color: 'bg-gray-500' },
];

const mockActivities: CalendarActivity[] = [
  {
    id: '1',
    title: 'Culto Dominical',
    description: 'Culto de celebração',
    date: '2026-01-19',
    startTime: '10:00',
    endTime: '12:00',
    type: 'culto',
    isRecurring: true,
    recurrencePattern: 'weekly',
  },
  {
    id: '2',
    title: 'Jejum Coletivo',
    description: 'Jejum de 21 dias',
    date: '2026-01-15',
    startTime: '06:00',
    type: 'jejum',
    isRecurring: false,
  },
  {
    id: '3',
    title: 'Treinamento de Líderes',
    date: '2026-01-22',
    startTime: '19:00',
    endTime: '21:00',
    type: 'treinamento',
    isRecurring: false,
  },
];

export default function ActivityCalendarPage() {
  const { value: activities, setValue: setActivities } = useDbStorage<CalendarActivity[]>('activity_calendar', []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'culto' as ActivityType,
    isRecurring: false,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAddActivity = () => {
    const activity: CalendarActivity = {
      id: Date.now().toString(),
      ...newActivity,
    };
    setActivities([...activities, activity]);
    setIsAddDialogOpen(false);
    setNewActivity({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'culto',
      isRecurring: false,
    });
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const getActivityColor = (type: ActivityType) => {
    return activityTypes.find(t => t.value === type)?.color || 'bg-gray-500';
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(a => isSameDay(new Date(a.date), date));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendário de Atividades</h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie todas as atividades da igreja
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Atividade</DialogTitle>
                <DialogDescription>
                  Adicione uma nova atividade ao calendário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Nome da atividade"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Descrição opcional..."
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(value: ActivityType) => setNewActivity({ ...newActivity, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hora Início</Label>
                    <Input
                      type="time"
                      value={newActivity.startTime}
                      onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Hora Fim</Label>
                    <Input
                      type="time"
                      value={newActivity.endTime}
                      onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddActivity}>Criar Atividade</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
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
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dayActivities = getActivitiesForDate(day);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 rounded-lg border text-left transition-colors
                        ${isToday(day) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}
                        ${selectedDate && isSameDay(day, selectedDate) ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <span className={`text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayActivities.slice(0, 2).map(activity => (
                          <div
                            key={activity.id}
                            className={`text-xs text-white px-1 py-0.5 rounded truncate ${getActivityColor(activity.type)}`}
                          >
                            {activity.title}
                          </div>
                        ))}
                        {dayActivities.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{dayActivities.length - 2} mais</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Atividades</CardTitle>
              <CardDescription>
                Atividades programadas para este mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getActivityColor(activity.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(activity.date), 'dd/MM/yyyy')}
                        <Clock className="w-3 h-3 ml-1" />
                        {activity.startTime}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity Type Legend */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              {activityTypes.map(type => (
                <div key={type.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <span className="text-sm">{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
