import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentMembers } from '@/components/dashboard/RecentMembers';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { BirthdaysList } from '@/components/dashboard/BirthdaysList';
import { MembersProgressTable } from '@/components/dashboard/MembersProgressTable';
import { mockDashboardStats } from '@/lib/mock-data';
import {
  Users,
  UserCheck,
  UserPlus,
  Droplets,
  TrendingUp,
  HandHeart,
  Cake,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDbStorage } from '@/hooks/useDbStorage';
import { PLCGroup } from '@/types';

export default function Dashboard() {
  const stats = mockDashboardStats;

  // ── Real-time member counts from Supabase ──────────────────────────
  const { data: totalMembers = 0 } = useQuery({
    queryKey: ['dashboard_total_members'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000, // refresh every 30s
  });

  const { data: activeMembers = 0 } = useQuery({
    queryKey: ['dashboard_active_members'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  // PLC data — same source as /plc page (useDbStorage)
  const { value: plcGroupsList = [] } = useDbStorage<PLCGroup[]>('plc_groups_list', []);
  const plcGroups = plcGroupsList.filter(g => g.isActive).length;
  const plcParticipants = plcGroupsList.reduce((acc, g) => acc + (g.members?.length ?? 0), 0);

  // Nuevas conversiones — members registered this month vs last month
  const { data: conversionStats } = useQuery({
    queryKey: ['dashboard_conversions'],
    queryFn: async () => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      const [thisMon, lastMon] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
      ]);

      const thisCount = thisMon.count ?? 0;
      const lastCount = lastMon.count ?? 0;

      let changeLabel = 'Este mes';
      let changeType: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (lastCount === 0 && thisCount > 0) {
        changeLabel = `+${thisCount} este mes`;
        changeType = 'positive';
      } else if (lastCount > 0) {
        const diff = thisCount - lastCount;
        const pct  = Math.round(Math.abs(diff / lastCount) * 100);
        if (diff > 0)  { changeLabel = `+${pct}% vs mes anterior`; changeType = 'positive'; }
        else if (diff < 0) { changeLabel = `-${pct}% vs mes anterior`; changeType = 'negative'; }
        else { changeLabel = 'igual al mes anterior'; changeType = 'neutral'; }
      }

      return { count: thisCount, changeLabel, changeType };
    },
    refetchInterval: 30000,
  });

  // Bautismos del mes + próximo batismo
  const { data: baptismStats } = useQuery({
    queryKey: ['dashboard_baptisms'],
    queryFn: async () => {
      const now = new Date();

      // ✅ Use local date to avoid timezone issues
      const y = now.getFullYear();
      const m = now.getMonth(); // 0-indexed
      const thisMonthStart = new Date(y, m, 1).toISOString();
      const thisMonthEnd   = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

      // Local date string YYYY-MM-DD (not UTC)
      const localDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const [completedRes, nextRes] = await Promise.all([
        // Completed this month (by scheduled_date in the month)
        supabase
          .from('baptisms')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('scheduled_date', thisMonthStart)
          .lte('scheduled_date', thisMonthEnd),
        // Next upcoming: all scheduled ordered ASC, take first
        supabase
          .from('baptisms')
          .select('scheduled_date')
          .eq('status', 'scheduled')
          .gte('scheduled_date', localDate)
          .order('scheduled_date', { ascending: true })
          .limit(1),
      ]);

      const completedCount = completedRes.count ?? 0;
      const nextDate = nextRes.data?.[0]?.scheduled_date ?? null;

      let nextLabel = 'Sin programar';
      if (nextDate) {
        // Parse safely without timezone shift
        const [ny, nm, nd] = nextDate.split('-').map(Number);
        const d = new Date(ny, nm - 1, nd);
        nextLabel = `Próximo: ${d.toLocaleDateString('es', { day: 'numeric', month: 'short' })}`;
      }

      return { count: completedCount, nextLabel };
    },
    refetchInterval: 30000,
  });

  const activePctStr = totalMembers > 0
    ? `${Math.round((activeMembers / totalMembers) * 100)}% del total`
    : '—';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resumen administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido al sistema administrativo de Nuevos Hechos
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Miembros"
            value={totalMembers}
            change="Total registrados"
            changeType="positive"
            icon={Users}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Miembros Activos"
            value={activeMembers}
            change={activePctStr}
            changeType="neutral"
            icon={UserCheck}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="Nuevas Conversiones"
            value={conversionStats?.count ?? 0}
            change={conversionStats?.changeLabel ?? 'Este mes'}
            changeType={conversionStats?.changeType ?? 'neutral'}
            icon={UserPlus}
            iconColor="bg-accent/10 text-accent"
          />
          <StatsCard
            title="Bautismos del Mes"
            value={baptismStats?.count ?? 0}
            change={baptismStats?.nextLabel ?? 'Sin programar'}
            changeType="neutral"
            icon={Droplets}
            iconColor="bg-blue-500/10 text-blue-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Asistencia Promedio"
            value={`${stats.averageAttendance}%`}
            change="+5% vs mes anterior"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-emerald-500/10 text-emerald-500"
          />
          <StatsCard
            title="Grupos de PLC"
            value={plcGroups}
            change={`${plcParticipants} participantes`}
            changeType="neutral"
            icon={HandHeart}
            iconColor="bg-purple-500/10 text-purple-500"
          />
          <StatsCard
            title="Cumpleañeros"
            value={stats.birthdaysThisWeek}
            change="Esta semana"
            changeType="neutral"
            icon={Cake}
            iconColor="bg-pink-500/10 text-pink-500"
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentMembers />
          </div>
          <BirthdaysList />
        </div>

        {/* Events */}
        <UpcomingEvents />

        {/* Desempeño de Miembros */}
        <MembersProgressTable />
      </div>
    </MainLayout>
  );
}
