import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Banknote,
  Plus,
  Search,
  Calendar,
  Download,
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  ChevronDown,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TitheRecord, TitheCategory, TitheCurrency } from '@/components/tithes/AddTitheDialog';
import { EditTitheDialog } from '@/components/tithes/EditTitheDialog';
import { DeleteTitheDialog } from '@/components/tithes/DeleteTitheDialog';
import { TitheDetailsDialog } from '@/components/tithes/TitheDetailsDialog';
import { DonationReceiptDialog } from '@/components/tithes/DonationReceiptDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  rowToTitheRecord,
  titheRecordToRow,
  getRecordTotal,
  getCategoryAmount,
  matchesCategoryFilter,
  matchesDateFilters,
  formatTitheCurrency,
  CATEGORY_LABELS,
  SPANISH_MONTHS,
  buildYearOptions,
  TitheRecordRow,
} from '@/lib/titheRecords';

const CATEGORY_OPTIONS: { value: TitheCategory | 'all'; label: string }[] = [
  { value: 'all', label: CATEGORY_LABELS.all },
  { value: 'diezmo', label: CATEGORY_LABELS.diezmo },
  { value: 'ofrenda', label: CATEGORY_LABELS.ofrenda },
  { value: 'primicia', label: CATEGORY_LABELS.primicia },
  { value: 'pro_templo', label: CATEGORY_LABELS.pro_templo },
  { value: 'ofrenda_especial', label: CATEGORY_LABELS.ofrenda_especial },
];

export default function Tithes() {
  const navigate = useNavigate();
  const [tithes, setTithes] = useState<TitheRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<TitheCategory | 'all'>('all');
  const [displayCurrency, setDisplayCurrency] = useState<TitheCurrency>('GTQ');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTithe, setSelectedTithe] = useState<TitheRecord | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const years = useMemo(() => buildYearOptions(), []);

  const loadTithes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tithe_records')
      .select('*')
      .order('tithe_date', { ascending: false });

    if (error) {
      toast.error('Error al cargar registros');
      setLoading(false);
      return;
    }

    setTithes((data || []).map((row) => rowToTitheRecord(row as TitheRecordRow)));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTithes();
  }, [loadTithes]);

  const filteredTithes = useMemo(() => {
    return tithes
      .filter((tithe) => {
        const matchesSearch = tithe.memberName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = matchesDateFilters(tithe, dayFilter, monthFilter, yearFilter);
        const matchesCategory = matchesCategoryFilter(tithe, categoryFilter);
        const matchesCurrency = tithe.currency === displayCurrency;
        return matchesSearch && matchesDate && matchesCategory && matchesCurrency;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tithes, searchQuery, dayFilter, monthFilter, yearFilter, categoryFilter, displayCurrency]);

  const sumFilteredAmount = (record: TitheRecord) =>
    categoryFilter === 'all'
      ? getRecordTotal(record)
      : getCategoryAmount(record, categoryFilter);

  const stats = useMemo(() => {
    const total = filteredTithes.reduce((sum, t) => sum + sumFilteredAmount(t), 0);
    const totalTithes = filteredTithes.reduce((sum, t) => sum + (t.titheAmount || 0), 0);
    const totalOfferings = filteredTithes.reduce((sum, t) => sum + (t.offeringAmount || 0), 0);
    const totalPrimicia = filteredTithes.reduce((sum, t) => sum + (t.firstFruitsAmount || 0), 0);
    const totalProTemplo = filteredTithes.reduce((sum, t) => sum + (t.proTemploAmount || 0), 0);
    const totalEspecial = filteredTithes.reduce((sum, t) => sum + (t.specialOfferingAmount || 0), 0);
    const uniqueMembers = new Set(filteredTithes.map((t) => t.memberName)).size;

    return {
      total,
      totalTithes,
      totalOfferings,
      totalPrimicia,
      totalProTemplo,
      totalEspecial,
      uniqueMembers,
      count: filteredTithes.length,
    };
  }, [filteredTithes, categoryFilter]);

  const monthlyReport = useMemo(() => {
    const report: Record<string, { total: number; count: number; cash: number; transfer: number }> = {};

    tithes
      .filter((t) => t.currency === displayCurrency)
      .forEach((tithe) => {
        const date = new Date(tithe.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!report[key]) {
          report[key] = { total: 0, count: 0, cash: 0, transfer: 0 };
        }

        const amount = getRecordTotal(tithe);
        report[key].total += amount;
        report[key].count += 1;
        if (tithe.paymentMethod === 'transfer') {
          report[key].transfer += amount;
        } else {
          report[key].cash += amount;
        }
      });

    return Object.entries(report)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, data]) => ({ period: key, ...data }));
  }, [tithes, displayCurrency]);

  const formatCurrency = (amount: number) => formatTitheCurrency(amount, displayCurrency);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('es-GT');

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthLabel = SPANISH_MONTHS.find((m) => m.value === month)?.label || month;
    return `${monthLabel} ${year}`;
  };

  const handleEditTithe = async (updatedTithe: TitheRecord) => {
    const { error } = await supabase
      .from('tithe_records')
      .update(titheRecordToRow(updatedTithe))
      .eq('id', updatedTithe.id);

    if (error) {
      toast.error('No se pudo actualizar el registro');
      return;
    }

    toast.success('Registro actualizado con éxito');
    setEditDialogOpen(false);
    loadTithes();
  };

  const handleDeleteTithe = async () => {
    if (!selectedTithe) return;
    const { error } = await supabase.from('tithe_records').delete().eq('id', selectedTithe.id);

    if (error) {
      toast.error('No se pudo eliminar el registro');
      return;
    }

    setDeleteDialogOpen(false);
    setDetailsDialogOpen(false);
    setSelectedTithe(null);
    toast.success('Registro eliminado con éxito');
    loadTithes();
  };

  const handleViewDetails = (tithe: TitheRecord) => {
    setSelectedTithe(tithe);
    setDetailsDialogOpen(true);
  };

  const exportToCSV = (data: TitheRecord[], filename: string) => {
    const headers = [
      'Fecha',
      'Miembro',
      'Moneda',
      'Diezmo',
      'Ofrenda',
      'Primicia',
      'ProTemplo',
      'Ofrenda Especial',
      'Total',
      'Observaciones',
    ];
    const rows = data.map((t) => [
      formatDate(t.date),
      t.memberName,
      t.currency,
      (t.titheAmount || 0).toFixed(2),
      (t.offeringAmount || 0).toFixed(2),
      (t.firstFruitsAmount || 0).toFixed(2),
      (t.proTemploAmount || 0).toFixed(2),
      (t.specialOfferingAmount || 0).toFixed(2),
      getRecordTotal(t).toFixed(2),
      t.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    toast.success('Datos exportados con éxito');
  };

  const paymentMethodLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cheque: 'Cheque',
    cash: 'Efectivo',
    transfer: 'Transferencia',
  };

  const paymentMethodColors: Record<string, string> = {
    efectivo: 'bg-green-500/10 text-green-600',
    transferencia: 'bg-blue-500/10 text-blue-600',
    cheque: 'bg-amber-500/10 text-amber-600',
    cash: 'bg-green-500/10 text-green-600',
    transfer: 'bg-blue-500/10 text-blue-600',
  };

  const totalGeneralLabel =
    categoryFilter === 'all'
      ? 'Total General'
      : `Total ${CATEGORY_LABELS[categoryFilter]}`;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Banknote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Control de Diezmos y Ofrendas
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestión y control de diezmos y ofrendas de la iglesia
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:justify-end gap-2">
            <Select
              value={displayCurrency}
              onValueChange={(v: TitheCurrency) => setDisplayCurrency(v)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTQ">Quetzal (Q)</SelectItem>
                <SelectItem value="USD">Dólar ($)</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">Exportar</span>
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(filteredTithes, 'diezmos-filtrados')}>
                  Exportar filtrados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tithes, 'diezmos-completo')}>
                  Exportar todos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={() => navigate('/recibo-donacion')}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="truncate">Recibo</span>
            </Button>
            <Button
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={() => navigate('/registro-diezmos')}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Registrar</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{totalGeneralLabel}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(stats.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Banknote className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diezmos</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalTithes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ofrendas</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalOfferings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-xl font-bold">{stats.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records" className="gap-2">
              <FileText className="w-4 h-4" />
              Registros
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Calendar className="w-4 h-4" />
              Informes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fecha específica</Label>
                  <Input
                    type="date"
                    value={dayFilter === 'all' ? '' : dayFilter}
                    onChange={(e) => setDayFilter(e.target.value || 'all')}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mes</Label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPANISH_MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Año</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v as TitheCategory | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(dayFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    setDayFilter('all');
                    setMonthFilter('all');
                    setYearFilter('all');
                  }}
                >
                  Limpiar filtros de fecha
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Nombre del Miembro</TableHead>
                        <TableHead>Diezmo</TableHead>
                        <TableHead>Ofrenda</TableHead>
                        <TableHead>Primicia</TableHead>
                        <TableHead>ProTemplo</TableHead>
                        <TableHead>Of. Especial</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : filteredTithes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            No se encontraron registros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTithes.map((tithe) => (
                          <TableRow
                            key={tithe.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleViewDetails(tithe)}
                          >
                            <TableCell className="font-medium">{formatDate(tithe.date)}</TableCell>
                            <TableCell>{tithe.memberName}</TableCell>
                            <TableCell>{formatTitheCurrency(tithe.titheAmount || 0, tithe.currency)}</TableCell>
                            <TableCell>{formatTitheCurrency(tithe.offeringAmount || 0, tithe.currency)}</TableCell>
                            <TableCell>{formatTitheCurrency(tithe.firstFruitsAmount || 0, tithe.currency)}</TableCell>
                            <TableCell>{formatTitheCurrency(tithe.proTemploAmount || 0, tithe.currency)}</TableCell>
                            <TableCell>{formatTitheCurrency(tithe.specialOfferingAmount || 0, tithe.currency)}</TableCell>
                            <TableCell className="font-bold text-primary">
                              {formatTitheCurrency(sumFilteredAmount(tithe), tithe.currency)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(tithe);
                                }}
                              >
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden divide-y divide-border">
                  {loading ? (
                    <div className="p-6 text-center text-muted-foreground">Cargando...</div>
                  ) : filteredTithes.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No se encontraron registros.
                    </div>
                  ) : (
                    filteredTithes.map((tithe) => (
                      <div
                        key={tithe.id}
                        className="p-4 cursor-pointer active:bg-muted/50"
                        onClick={() => handleViewDetails(tithe)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate mr-2">{tithe.memberName}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(tithe.date)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[categoryFilter]}
                          </Badge>
                          <p className="font-bold text-primary">
                            {formatTitheCurrency(sumFilteredAmount(tithe), tithe.currency)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informe mensual ({displayCurrency === 'GTQ' ? 'Quetzal' : 'Dólar'})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Efectivo</TableHead>
                        <TableHead className="text-right">Transferencia</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReport.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No hay datos disponibles.
                          </TableCell>
                        </TableRow>
                      ) : (
                        monthlyReport.map((report) => (
                          <TableRow key={report.period}>
                            <TableCell className="font-medium">{formatPeriod(report.period)}</TableCell>
                            <TableCell className="text-right">{report.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.cash)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.transfer)}</TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {formatCurrency(report.total)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Resumen anual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const annualData: Record<string, number> = {};
                    tithes
                      .filter((t) => t.currency === displayCurrency)
                      .forEach((t) => {
                        const year = new Date(t.date).getFullYear().toString();
                        annualData[year] = (annualData[year] || 0) + getRecordTotal(t);
                      });

                    return Object.entries(annualData)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([year, total]) => (
                        <div key={year} className="p-4 rounded-lg bg-muted/50 border">
                          <p className="text-sm text-muted-foreground">Año {year}</p>
                          <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                        </div>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditTitheDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tithe={selectedTithe}
        onSubmit={handleEditTithe}
      />

      <DeleteTitheDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tithe={selectedTithe}
        onConfirm={handleDeleteTithe}
      />

      <TitheDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        tithe={selectedTithe}
        onEdit={() => {
          setDetailsDialogOpen(false);
          setEditDialogOpen(true);
        }}
        onDelete={() => {
          setDetailsDialogOpen(false);
          setDeleteDialogOpen(true);
        }}
      />

      <DonationReceiptDialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen} />
    </MainLayout>
  );
}
