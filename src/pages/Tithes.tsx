import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Banknote, Plus, Search, Calendar, Download, TrendingUp, 
  Users, CreditCard, FileText, ChevronDown, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { AddTitheDialog, TitheRecord } from '@/components/tithes/AddTitheDialog';
import { EditTitheDialog } from '@/components/tithes/EditTitheDialog';
import { DeleteTitheDialog } from '@/components/tithes/DeleteTitheDialog';
import { TitheDetailsDialog } from '@/components/tithes/TitheDetailsDialog';
import { DonationReceiptDialog } from '@/components/tithes/DonationReceiptDialog';
import { toast } from 'sonner';

// Mock data
const initialTithes: TitheRecord[] = [
  {
    id: '1',
    memberName: 'Juan Carlos García',
    date: '2024-01-28',
    titheAmount: 500.00,
    tithePaymentMethod: 'efectivo',
    offeringAmount: 50.00,
    offeringPaymentMethod: 'efectivo',
    firstFruitsAmount: 0,
    firstFruitsPaymentMethod: 'efectivo',
    createdAt: '2024-01-28T10:00:00Z',
    amount: 550.00,
    paymentMethod: 'cash',
  },
  {
    id: '2',
    memberName: 'María Elena López',
    date: '2024-01-28',
    titheAmount: 750.00,
    tithePaymentMethod: 'transferencia',
    titheTransferNumber: 'TRF-2024-001',
    offeringAmount: 100.00,
    offeringPaymentMethod: 'efectivo',
    firstFruitsAmount: 0,
    firstFruitsPaymentMethod: 'efectivo',
    createdAt: '2024-01-28T11:30:00Z',
    amount: 850.00,
    paymentMethod: 'transfer',
    reference: 'TRF-2024-001',
  },
  {
    id: '3',
    memberName: 'Pedro Hernández',
    date: '2024-01-21',
    titheAmount: 300.00,
    tithePaymentMethod: 'efectivo',
    offeringAmount: 0,
    offeringPaymentMethod: 'efectivo',
    firstFruitsAmount: 0,
    firstFruitsPaymentMethod: 'efectivo',
    createdAt: '2024-01-21T10:15:00Z',
    amount: 300.00,
    paymentMethod: 'cash',
  },
  {
    id: '4',
    memberName: 'Ana Sofía Martínez',
    date: '2024-01-21',
    titheAmount: 800.00,
    tithePaymentMethod: 'transferencia',
    titheTransferNumber: 'TRF-2024-002',
    offeringAmount: 200.00,
    offeringPaymentMethod: 'transferencia',
    offeringTransferNumber: 'TRF-2024-002-B',
    firstFruitsAmount: 150.00,
    firstFruitsPaymentMethod: 'efectivo',
    notes: 'Diezmo del mes de enero',
    createdAt: '2024-01-21T09:45:00Z',
    amount: 1150.00,
    paymentMethod: 'transfer',
    reference: 'TRF-2024-002',
  },
  {
    id: '5',
    memberName: 'Roberto Méndez',
    date: '2024-01-14',
    titheAmount: 450.00,
    tithePaymentMethod: 'cheque',
    offeringAmount: 0,
    offeringPaymentMethod: 'efectivo',
    firstFruitsAmount: 0,
    firstFruitsPaymentMethod: 'efectivo',
    createdAt: '2024-01-14T10:30:00Z',
    amount: 450.00,
    paymentMethod: 'cash',
  },
  {
    id: '6',
    memberName: 'Carmen Rosa Díaz',
    date: '2024-02-04',
    titheAmount: 400.00,
    tithePaymentMethod: 'transferencia',
    titheTransferNumber: 'TRF-2024-003',
    offeringAmount: 200.00,
    offeringPaymentMethod: 'transferencia',
    offeringTransferNumber: 'TRF-2024-003-B',
    firstFruitsAmount: 100.00,
    firstFruitsPaymentMethod: 'transferencia',
    firstFruitsTransferNumber: 'TRF-2024-003-C',
    createdAt: '2024-02-04T11:00:00Z',
    amount: 700.00,
    paymentMethod: 'transfer',
    reference: 'TRF-2024-003',
  },
];

const months = [
  { value: 'all', label: 'Todos os meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const years = [
  { value: 'all', label: 'Todos os anos' },
  { value: currentYear.toString(), label: currentYear.toString() },
  { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
  { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
];

export default function Tithes() {
  const navigate = useNavigate();
  const [tithes, setTithes] = useState<TitheRecord[]>(initialTithes);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Dialog states
  // Check for pending tithes from the registration page
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingTithe');
    if (pending) {
      try {
        const newTithes = JSON.parse(pending) as TitheRecord[];
        if (newTithes.length > 0) {
          setTithes(prev => [...prev, ...newTithes]);
        }
      } catch {}
      sessionStorage.removeItem('pendingTithe');
    }
  }, []);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTithe, setSelectedTithe] = useState<TitheRecord | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  // Filter tithes
  const filteredTithes = useMemo(() => {
    return tithes.filter((tithe) => {
      const matchesSearch = tithe.memberName.toLowerCase().includes(searchQuery.toLowerCase());
      const titheDate = new Date(tithe.date);
      const titheMonth = String(titheDate.getMonth() + 1).padStart(2, '0');
      const titheYear = titheDate.getFullYear().toString();
      
      const matchesMonth = monthFilter === 'all' || titheMonth === monthFilter;
      const matchesYear = yearFilter === 'all' || titheYear === yearFilter;
      const matchesPayment = paymentFilter === 'all' || tithe.paymentMethod === paymentFilter;
      
      return matchesSearch && matchesMonth && matchesYear && matchesPayment;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tithes, searchQuery, monthFilter, yearFilter, paymentFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTithes = filteredTithes.reduce((sum, t) => sum + (t.titheAmount || 0), 0);
    const totalOfferings = filteredTithes.reduce((sum, t) => sum + (t.offeringAmount || 0), 0);
    const total = totalTithes + totalOfferings;
    const uniqueMembers = new Set(filteredTithes.map(t => t.memberName)).size;
    
    return { total, totalTithes, totalOfferings, uniqueMembers, count: filteredTithes.length };
  }, [filteredTithes]);

  // Monthly report data
  const monthlyReport = useMemo(() => {
    const report: Record<string, { total: number; count: number; cash: number; transfer: number }> = {};
    
    tithes.forEach(tithe => {
      const date = new Date(tithe.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!report[key]) {
        report[key] = { total: 0, count: 0, cash: 0, transfer: 0 };
      }
      
      report[key].total += tithe.amount;
      report[key].count += 1;
      report[key][tithe.paymentMethod] += tithe.amount;
    });
    
    return Object.entries(report)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, data]) => ({
        period: key,
        ...data,
      }));
  }, [tithes]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Q ${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Format period
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${monthNames[parseInt(month)]} ${year}`;
  };

  // Handlers
  const handleAddTithe = (tithe: TitheRecord) => {
    setTithes([...tithes, tithe]);
    toast.success('Dízimo registrado com sucesso!');
  };

  const handleEditTithe = (updatedTithe: TitheRecord) => {
    setTithes(tithes.map((t) => (t.id === updatedTithe.id ? updatedTithe : t)));
    toast.success('Dízimo atualizado com sucesso!');
  };

  const handleDeleteTithe = () => {
    if (selectedTithe) {
      setTithes(tithes.filter((t) => t.id !== selectedTithe.id));
      setDeleteDialogOpen(false);
      setDetailsDialogOpen(false);
      setSelectedTithe(null);
      toast.success('Registro excluído com sucesso!');
    }
  };

  const handleViewDetails = (tithe: TitheRecord) => {
    setSelectedTithe(tithe);
    setDetailsDialogOpen(true);
  };

  const handleEditFromDetails = () => {
    setDetailsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleDeleteFromDetails = () => {
    setDetailsDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  // Export to CSV
  const exportToCSV = (data: TitheRecord[], filename: string) => {
    const headers = ['Data', 'Nome do Membro', 'Valor (Q)', 'Forma de Pagamento', 'Referência', 'Observações'];
    const rows = data.map(t => [
      formatDate(t.date),
      t.memberName,
      t.amount.toFixed(2),
      t.paymentMethod === 'cash' ? 'Dinheiro' : 'Transferência',
      t.reference || '',
      t.notes || '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    toast.success('Dados exportados com sucesso!');
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Banknote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Control de Diezmos y Ofrendas</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestión y control de diezmos y ofrendas de la iglesia (Quetzal)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">Exportar</span>
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(filteredTithes, 'dizimos-filtrados')}>
                  Exportar Filtrados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tithes, 'dizimos-completo')}>
                  Exportar Todos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => navigate('/recibo-donacion')}>
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="truncate">Recibo</span>
            </Button>
            <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => navigate('/registro-diezmos')}>
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Registrar</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total General</p>
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
                  <p className="text-sm text-muted-foreground">Miembros</p>
                  <p className="text-xl font-bold">{stats.uniqueMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records" className="gap-2">
              <FileText className="w-4 h-4" />
              Registros
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Calendar className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Records */}
            <Card>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Nombre del Miembro</TableHead>
                        <TableHead>Diezmo</TableHead>
                        <TableHead>Ofrenda</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTithes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No se encontraron registros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTithes.map((tithe) => (
                          <TableRow key={tithe.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(tithe)}>
                            <TableCell className="font-medium">{formatDate(tithe.date)}</TableCell>
                            <TableCell>{tithe.memberName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold">{formatCurrency(tithe.titheAmount || 0)}</span>
                                <Badge className={cn('border-0 text-xs w-fit', paymentMethodColors[tithe.tithePaymentMethod || 'efectivo'])}>
                                  {paymentMethodLabels[tithe.tithePaymentMethod || 'efectivo']}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold">{formatCurrency(tithe.offeringAmount || 0)}</span>
                                <Badge className={cn('border-0 text-xs w-fit', paymentMethodColors[tithe.offeringPaymentMethod || 'efectivo'])}>
                                  {paymentMethodLabels[tithe.offeringPaymentMethod || 'efectivo']}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              {formatCurrency((tithe.titheAmount || 0) + (tithe.offeringAmount || 0))}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(tithe); }}>
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                  {filteredTithes.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No se encontraron registros.
                    </div>
                  ) : (
                    filteredTithes.map((tithe) => (
                      <div
                        key={tithe.id}
                        className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
                        onClick={() => handleViewDetails(tithe)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground truncate mr-2">{tithe.memberName}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(tithe.date)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Diezmo</span>
                              <p className="font-semibold">{formatCurrency(tithe.titheAmount || 0)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Ofrenda</span>
                              <p className="font-semibold">{formatCurrency(tithe.offeringAmount || 0)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground text-xs">Total</span>
                            <p className="font-bold text-primary">{formatCurrency((tithe.titheAmount || 0) + (tithe.offeringAmount || 0))}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Relatório Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Dinheiro</TableHead>
                        <TableHead className="text-right">Transferência</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReport.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Nenhum dado disponível.
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

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                  {monthlyReport.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      Nenhum dado disponível.
                    </div>
                  ) : (
                    monthlyReport.map((report) => (
                      <div key={report.period} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{formatPeriod(report.period)}</span>
                          <span className="text-xs text-muted-foreground">{report.count} registros</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex gap-3">
                            <div>
                              <span className="text-muted-foreground text-xs">Efectivo</span>
                              <p className="font-semibold">{formatCurrency(report.cash)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Transfer.</span>
                              <p className="font-semibold">{formatCurrency(report.transfer)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground text-xs">Total</span>
                            <p className="font-bold text-primary">{formatCurrency(report.total)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Annual Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Resumo Anual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const annualData: Record<string, number> = {};
                    tithes.forEach(t => {
                      const year = new Date(t.date).getFullYear().toString();
                      annualData[year] = (annualData[year] || 0) + t.amount;
                    });
                    
                    return Object.entries(annualData)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([year, total]) => (
                        <div key={year} className="p-4 rounded-lg bg-muted/50 border">
                          <p className="text-sm text-muted-foreground">Ano {year}</p>
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

      {/* Dialogs */}

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
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <DonationReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
      />
    </MainLayout>
  );
}
