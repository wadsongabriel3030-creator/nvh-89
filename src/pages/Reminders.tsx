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
import { Switch } from '@/components/ui/switch';
import { Plus, Bell, Calendar, Clock, Repeat, Edit, Trash2, BellRing } from 'lucide-react';
import { Reminder } from '@/types';
import { format } from 'date-fns';

const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'Culto Dominical',
    description: 'Lembrete para o culto de domingo',
    type: 'culto',
    targetDate: '2026-01-19',
    notifyAt: '2026-01-19T08:00:00',
    isRecurring: true,
    recurrencePattern: 'weekly',
    recipients: ['all'],
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    title: 'Reunião de Líderes',
    description: 'Reunião mensal de líderes de PLC',
    type: 'reuniao',
    targetDate: '2026-01-25',
    notifyAt: '2026-01-24T18:00:00',
    isRecurring: true,
    recurrencePattern: 'monthly',
    recipients: ['leaders'],
    isActive: true,
    createdAt: '2026-01-05',
  },
  {
    id: '3',
    title: 'Aniversário - João Silva',
    description: 'Enviar mensagem de aniversário',
    type: 'birthday',
    targetDate: '2026-01-22',
    notifyAt: '2026-01-22T08:00:00',
    isRecurring: false,
    recipients: ['pastors'],
    isActive: true,
    createdAt: '2026-01-10',
  },
];

const reminderTypes = [
  { value: 'event', label: 'Evento', icon: Calendar },
  { value: 'culto', label: 'Culto', icon: Bell },
  { value: 'reuniao', label: 'Reunião', icon: Clock },
  { value: 'birthday', label: 'Aniversário', icon: BellRing },
  { value: 'custom', label: 'Personalizado', icon: Bell },
];

export default function RemindersPage() {
  const { value: reminders, setValue: setReminders } = useDbStorage<Reminder[]>('reminders_list', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'custom' as Reminder['type'],
    targetDate: '',
    notifyAt: '',
    isRecurring: false,
    recurrencePattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
  });

  const handleAddReminder = () => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      type: newReminder.type,
      targetDate: newReminder.targetDate,
      notifyAt: newReminder.notifyAt,
      isRecurring: newReminder.isRecurring,
      recurrencePattern: newReminder.isRecurring ? newReminder.recurrencePattern : undefined,
      recipients: ['all'],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setReminders([...reminders, reminder]);
    setIsAddDialogOpen(false);
    setNewReminder({
      title: '',
      description: '',
      type: 'custom',
      targetDate: '',
      notifyAt: '',
      isRecurring: false,
      recurrencePattern: 'weekly',
    });
  };

  const handleDelete = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const getTypeLabel = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.label || type;
  };

  const getRecurrenceLabel = (pattern?: string) => {
    switch (pattern) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return 'Único';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recordatórios</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie lembretes e notificações automáticas
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Lembrete</DialogTitle>
                <DialogDescription>
                  Configure um novo lembrete automático
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="Ex: Reunião de Líderes"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    placeholder="Detalhes do lembrete..."
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(value: Reminder['type']) => setNewReminder({ ...newReminder, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data do Evento</Label>
                  <Input
                    type="date"
                    value={newReminder.targetDate}
                    onChange={(e) => setNewReminder({ ...newReminder, targetDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notificar em</Label>
                  <Input
                    type="datetime-local"
                    value={newReminder.notifyAt}
                    onChange={(e) => setNewReminder({ ...newReminder, notifyAt: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete Recorrente</Label>
                    <p className="text-sm text-muted-foreground">Repetir automaticamente</p>
                  </div>
                  <Switch
                    checked={newReminder.isRecurring}
                    onCheckedChange={(checked) => setNewReminder({ ...newReminder, isRecurring: checked })}
                  />
                </div>
                {newReminder.isRecurring && (
                  <div>
                    <Label>Frequência</Label>
                    <Select
                      value={newReminder.recurrencePattern}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setNewReminder({ ...newReminder, recurrencePattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddReminder}>Criar Lembrete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`transition-opacity ${!reminder.isActive ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      {reminder.title}
                    </CardTitle>
                    <CardDescription>{reminder.description}</CardDescription>
                  </div>
                  <Switch
                    checked={reminder.isActive}
                    onCheckedChange={() => handleToggleActive(reminder.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                  {reminder.isRecurring && (
                    <Badge variant="secondary" className="gap-1">
                      <Repeat className="w-3 h-3" />
                      {getRecurrenceLabel(reminder.recurrencePattern)}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(reminder.targetDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Notificar: {format(new Date(reminder.notifyAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reminders.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum lembrete configurado</h3>
            <p className="text-muted-foreground">Crie seu primeiro lembrete para começar.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
