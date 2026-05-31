import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Calendar, HandHeart, Droplets, TrendingUp, Download, FileText, FileSpreadsheet } from 'lucide-react';

const stats = {
  members: {
    total: 245,
    active: 198,
    inactive: 32,
    visitors: 15,
    growth: 12.5,
  },
  baptisms: {
    total: 45,
    thisYear: 12,
    thisMonth: 3,
  },
  events: {
    total: 156,
    thisMonth: 8,
    upcoming: 5,
  },
  plcs: {
    total: 12,
    active: 10,
    totalMembers: 120,
  },
  tithes: {
    totalYear: 125000,
    totalMonth: 12500,
    average: 520,
  },
};

export default function DatabaseOverviewPage() {
  const [period, setPeriod] = useState('year');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Base de Dados Geral</h1>
            <p className="text-muted-foreground mt-1">
              Central de estatísticas e dados administrativos
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="all">Todo Período</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.members.total}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total de Membros</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                +{stats.members.growth}% este ano
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.baptisms.total}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total de Batismos</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {stats.baptisms.thisYear} este ano
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.events.total}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Eventos Realizados</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {stats.events.upcoming} próximos eventos
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500">
                  <HandHeart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.plcs.total}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">PLCs</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {stats.plcs.totalMembers} membros em grupos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="baptisms">Batismos</TabsTrigger>
            <TabsTrigger value="plcs">PLCs</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Ativos</span>
                    <span className="font-bold text-green-600">{stats.members.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inativos</span>
                    <span className="font-bold text-red-600">{stats.members.inactive}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visitantes</span>
                    <span className="font-bold text-blue-600">{stats.members.visitors}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Faixa Etária</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>0-17 anos</span>
                    <span className="font-bold">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>18-35 anos</span>
                    <span className="font-bold">98</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>36-59 anos</span>
                    <span className="font-bold">72</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>60+ anos</span>
                    <span className="font-bold">30</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Ministério</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Louvor</span>
                    <span className="font-bold">25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mídia</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Infantil</span>
                    <span className="font-bold">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recepção</span>
                    <span className="font-bold">15</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Tipo</CardTitle>
                <CardDescription>Distribuição de eventos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">52</p>
                    <p className="text-sm text-muted-foreground">Cultos</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Conferências</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">36</p>
                    <p className="text-sm text-muted-foreground">Reuniões</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">44</p>
                    <p className="text-sm text-muted-foreground">Treinamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="baptisms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Batismos</CardTitle>
                <CardDescription>Batismos realizados por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, idx) => (
                    <div key={month} className="text-center">
                      <div className="h-16 bg-primary/20 rounded relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">{month}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plcs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de PLCs</CardTitle>
                <CardDescription>Visão geral dos grupos de comunhão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 rounded-lg bg-muted">
                    <p className="text-3xl font-bold text-primary">{stats.plcs.active}</p>
                    <p className="text-muted-foreground">PLCs Ativos</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted">
                    <p className="text-3xl font-bold text-primary">{stats.plcs.totalMembers}</p>
                    <p className="text-muted-foreground">Membros em PLCs</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted">
                    <p className="text-3xl font-bold text-primary">
                      {Math.round(stats.plcs.totalMembers / stats.plcs.active)}
                    </p>
                    <p className="text-muted-foreground">Média por Grupo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
