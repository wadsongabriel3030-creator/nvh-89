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

export default function Dashboard() {
  const stats = mockDashboardStats;

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
            value={stats.totalMembers}
            change="+12 este mes"
            changeType="positive"
            icon={Users}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Miembros Activos"
            value={stats.activeMembers}
            change={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% del total`}
            changeType="neutral"
            icon={UserCheck}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="Nuevas Conversiones"
            value={stats.newConversions}
            change="+3 esta semana"
            changeType="positive"
            icon={UserPlus}
            iconColor="bg-accent/10 text-accent"
          />
          <StatsCard
            title="Bautismos del Mes"
            value={stats.baptismsThisMonth}
            change="Próximo: 15 Feb"
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
            value={stats.plcGroups}
            change="142 participantes"
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
