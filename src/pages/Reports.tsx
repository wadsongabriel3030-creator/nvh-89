import { MainLayout } from '@/components/layout/MainLayout';
import { BarChart3, Download, FileText, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const reportTypes = [
  {
    id: 'members',
    title: 'Informe de Miembros',
    description: 'Lista completa de miembros con estado e información',
    icon: Users,
  },
  {
    id: 'attendance',
    title: 'Informe de Asistencia',
    description: 'Historial de asistencia en todas las actividades',
    icon: Calendar,
  },
  {
    id: 'growth',
    title: 'Informe de Crecimiento',
    description: 'Métricas de crecimiento y conversiones',
    icon: TrendingUp,
  },
  {
    id: 'plc',
    title: 'Informe de PLCs',
    description: 'Rendimiento y estadísticas de los PLCs',
    icon: BarChart3,
  },
];

export default function Reports() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Informes</h1>
              <p className="text-muted-foreground">
                Visualice y exporte informes de la iglesia
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="month">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-soft transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Exportar Informe Personalizado
            </CardTitle>
            <CardDescription>
              Seleccione los datos que desea incluir en el informe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" defaultChecked />
                <span className="text-sm">Datos de miembros</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" defaultChecked />
                <span className="text-sm">Asistencia</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm">Etiquetas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm">PLCs</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}