import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddActivityDialog, Activity } from '@/components/calendar/AddActivityDialog';
import { Button } from '@/components/ui/button';
import { CalendarActivity } from '@/lib/calendar-activities-2026';
import { calendarActivities2026 } from '@/lib/calendar-activities-2026';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const colorClasses = {
  purple: 'bg-purple-500/90 text-purple-100',
  blue: 'bg-blue-500/90 text-blue-100',
  green: 'bg-emerald-500/90 text-emerald-100',
  orange: 'bg-orange-500/90 text-orange-100',
  yellow: 'bg-amber-500/90 text-amber-100',
  pink: 'bg-pink-500/90 text-pink-100',
};

const dotColors: Record<string, string> = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-500',
  pink: 'bg-pink-500',
};

// Map Supabase row to CalendarActivity
function rowToActivity(row: any): CalendarActivity {
  return {
    id: row.id,
    title: row.title,
    color: (row.color || 'purple') as CalendarActivity['color'],
    date: parseISO(row.activity_date),
    comments: row.description || undefined,
    cycles: row.type || undefined,
  };
}

export default function CalendarTaskPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Edit & delete state
  const [editActivity, setEditActivity] = useState<CalendarActivity | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<CalendarActivity | null>(null);

  // Role-based access: admin or leader can manage activities
  const { isAdmin, permissions } = usePermissions();
  const canManage = isAdmin || permissions.includes('/calendar-2026');

  // Load activities from Supabase
  const loadActivities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_activities')
      .select('*')
      .order('activity_date', { ascending: true });

    if (error) {
      toast.error('Error al cargar actividades del calendario');
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setActivities(data.map(rowToActivity));
    } else {
      // Seed database with hardcoded activities on first use
      await seedActivities();
    }
    setLoading(false);
  }, []);

  // Seed the database with the hardcoded 2026 activities
  const seedActivities = async () => {
    const rows = calendarActivities2026.map((a) => ({
      id: a.id,
      title: a.title,
      color: a.color,
      activity_date: format(a.date, 'yyyy-MM-dd'),
      description: a.comments || null,
      type: a.cycles || null,
      is_recurring: false,
    }));

    const { error } = await supabase.from('calendar_activities').insert(rows);
    if (error) {
      // If seeding fails (e.g. duplicates), just load whatever is there
      const { data } = await supabase
        .from('calendar_activities')
        .select('*')
        .order('activity_date', { ascending: true });
      if (data) setActivities(data.map(rowToActivity));
      return;
    }

    // Re-load after seeding
    const { data } = await supabase
      .from('calendar_activities')
      .select('*')
      .order('activity_date', { ascending: true });
    if (data) setActivities(data.map(rowToActivity));
  };

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDaysMobile = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weekDaysDesktop = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getTasksForDate = (date: Date) => {
    return activities.filter(task => isSameDay(task.date, date));
  };

  const getUpcomingActivities = () => {
    let monthActivities = activities
      .filter(a => isSameMonth(a.date, currentDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      monthActivities = monthActivities.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.comments?.toLowerCase().includes(q) ||
        a.cycles?.toLowerCase().includes(q)
      );
    }

    if (selectedDate) {
      const selected = monthActivities.filter(a => isSameDay(a.date, selectedDate));
      if (selected.length > 0) return selected;
    }

    return monthActivities;
  };

  const handleAddActivity = async (activity: Activity) => {
    const row = {
      title: activity.title,
      color: activity.color,
      activity_date: format(activity.date, 'yyyy-MM-dd'),
      description: activity.comments || activity.observaciones || null,
      type: activity.cycles || null,
      start_time: activity.time || null,
      is_recurring: false,
    };

    const { error } = await supabase.from('calendar_activities').insert(row);
    if (error) {
      toast.error('Error al agregar actividad');
      return;
    }
    toast.success('Actividad agregada');
    loadActivities();
  };

  const handleEditActivity = async (activity: Activity) => {
    const { error } = await supabase
      .from('calendar_activities')
      .update({
        title: activity.title,
        color: activity.color,
        activity_date: format(activity.date, 'yyyy-MM-dd'),
        description: activity.comments || activity.observaciones || null,
        type: activity.cycles || null,
        start_time: activity.time || null,
      })
      .eq('id', activity.id);

    if (error) {
      toast.error('Error al actualizar actividad');
      return;
    }
    toast.success('Actividad actualizada');
    setEditActivity(null);
    loadActivities();
  };

  const handleDeleteActivity = async () => {
    if (!deleteActivity) return;
    const { error } = await supabase
      .from('calendar_activities')
      .delete()
      .eq('id', deleteActivity.id);

    if (error) {
      toast.error('Error al eliminar actividad');
      return;
    }
    toast.success('Actividad eliminada');
    setDeleteActivity(null);
    loadActivities();
  };

  const openEditDialog = (activity: CalendarActivity) => {
    setEditActivity(activity);
    setIsAddDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setEditActivity(null);
    setIsAddDialogOpen(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const upcomingActivities = getUpcomingActivities();

  // Compute stats dynamically
  const allMonthActivities = activities.filter(a => isSameMonth(a.date, currentDate));
  const statServices = allMonthActivities.filter(a => a.color === 'purple').length;
  const statMeetings = allMonthActivities.filter(a => a.color === 'blue').length;
  const statTrainings = allMonthActivities.filter(a => a.color === 'green').length;
  const statEvents = allMonthActivities.filter(a => ['orange', 'yellow', 'pink'].includes(a.color)).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background text-foreground p-3 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Calendario de Actividades
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">2026</p>
            </div>
            {canManage && (
              <Button
                onClick={handleOpenAddDialog}
                className="gap-2 w-full sm:w-auto"
                size="default"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            )}
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold min-w-[140px] sm:min-w-[180px] text-center capitalize text-foreground">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Search - hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar actividad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar actividad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-border">
              {weekDaysDesktop.map((day, i) => (
                <div
                  key={day + i}
                  className="py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-muted-foreground"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{weekDaysMobile[i]}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {loading ? (
                <div className="col-span-7 py-20 text-center text-muted-foreground">
                  Cargando actividades...
                </div>
              ) : (
                calendarDays.map((day, idx) => {
                  const tasksForDay = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const uniqueColors = [...new Set(tasksForDay.map(t => t.color))];

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[52px] sm:min-h-[80px] lg:min-h-[130px] p-1 sm:p-2 
                        border-b border-r border-border transition-colors 
                        hover:bg-muted/50 cursor-pointer
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : ''}
                      `}
                    >
                      <div className="flex items-center justify-center sm:justify-start mb-0.5 sm:mb-2">
                        <span
                          className={`text-xs sm:text-sm font-medium flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-colors ${
                            isTodayDate
                              ? 'bg-primary text-primary-foreground'
                              : isSelected
                              ? 'bg-accent text-accent-foreground'
                              : isCurrentMonth
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>

                      {/* Mobile: colored dots */}
                      <div className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                        {uniqueColors.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`}
                          />
                        ))}
                      </div>

                      {/* Tablet+: task labels */}
                      <div className="hidden sm:block space-y-0.5 lg:space-y-1">
                        {tasksForDay.slice(0, window.innerWidth >= 1024 ? 3 : 2).map((task) => (
                          <div
                            key={task.id}
                            className={`px-1.5 lg:px-2 py-0.5 lg:py-1 text-[10px] lg:text-xs rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity ${colorClasses[task.color]}`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {tasksForDay.length > (window.innerWidth >= 1024 ? 3 : 2) && (
                          <div className="text-[10px] lg:text-xs text-muted-foreground pl-1">
                            +{tasksForDay.length - (window.innerWidth >= 1024 ? 3 : 2)} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming / Selected Date Activities */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {selectedDate
                ? `Actividades - ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : 'Actividades del mes'}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-primary hover:underline mb-3 block"
              >
                Ver todas las del mes
              </button>
            )}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {upcomingActivities.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                  No hay actividades {selectedDate ? 'para esta fecha' : 'este mes'}
                </div>
              ) : (
                upcomingActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColors[activity.color]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {format(activity.date, "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                      {activity.comments && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {activity.comments}
                        </p>
                      )}
                      {activity.cycles && (
                        <span className="inline-block mt-1 text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {activity.cycles}
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete buttons - visible only for users with manage access */}
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(activity);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar actividad"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteActivity(activity);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar actividad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-sm text-muted-foreground">Leyenda:</span>
            {Object.entries(dotColors).map(([color]) => (
              <div key={color} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${dotColors[color]}`} />
                <span className="text-xs text-muted-foreground capitalize">{color === 'green' ? 'PLC/VNH' : color === 'yellow' ? 'noches' : color === 'pink' ? 'especial' : color === 'orange' ? 'oración' : color === 'blue' ? 'reunión' : 'servicio'}</span>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{statServices}</div>
              <div className="text-xs text-muted-foreground mt-1">Servicios</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{statMeetings}</div>
              <div className="text-xs text-muted-foreground mt-1">Reuniones</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{statTrainings}</div>
              <div className="text-xs text-muted-foreground mt-1">Capacitaciones</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{statEvents}</div>
              <div className="text-xs text-muted-foreground mt-1">Eventos</div>
            </div>
          </div>
        </div>

        {/* Add / Edit Activity Dialog */}
        <AddActivityDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setEditActivity(null);
          }}
          onSubmit={editActivity ? handleEditActivity : handleAddActivity}
          editActivity={editActivity ? {
            id: editActivity.id,
            title: editActivity.title,
            color: editActivity.color,
            date: editActivity.date,
            comments: editActivity.comments,
            cycles: editActivity.cycles,
          } : null}
        />

        {/* Delete confirmation dialog */}
        <Dialog open={!!deleteActivity} onOpenChange={(o) => !o && setDeleteActivity(null)}>
          <DialogContent className="max-w-sm bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <DialogHeader>
              <DialogTitle>Eliminar actividad</DialogTitle>
              <DialogDescription className="text-gray-400">
                ¿Está seguro que desea eliminar <strong className="text-white">{deleteActivity?.title}</strong>?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteActivity(null)}
                className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteActivity}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
