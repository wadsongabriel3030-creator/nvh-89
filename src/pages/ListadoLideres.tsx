import { MainLayout } from '@/components/layout/MainLayout';
import { Users, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Leader = {
  id: string;
  position: number;
  name: string;
  category: 'Adulto' | 'Joven Adulto' | 'Joven';
  phone: string | null;
};

const categoryColors: Record<string, string> = {
  Adulto: 'bg-primary/10 text-primary border-0',
  'Joven Adulto': 'bg-amber-500/10 text-amber-600 border-0',
  Joven: 'bg-emerald-500/10 text-emerald-600 border-0',
};

export default function ListadoLideres() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaders_list')
        .select('id, position, name, category, phone')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Leader[];
    },
  });

  const totalAdultos = leaders.filter((l) => l.category === 'Adulto').length;
  const totalJovenAdulto = leaders.filter((l) => l.category === 'Joven Adulto').length;
  const totalJovenes = leaders.filter((l) => l.category === 'Joven').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Listado de Líderes</h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Cargando…' : `${leaders.length} líderes registrados`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAdultos}</p>
                <p className="text-sm text-muted-foreground">Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenAdulto}</p>
                <p className="text-sm text-muted-foreground">Jóvenes Adultos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalJovenes}</p>
                <p className="text-sm text-muted-foreground">Jóvenes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Líderes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Teléfono</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {leader.position}
                    </TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>
                      <Badge className={categoryColors[leader.category] || ''}>
                        {leader.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {leader.phone || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
