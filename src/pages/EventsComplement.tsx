import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users, QrCode, Download, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EventWithParticipants {
  id: string;
  title: string;
  date: string;
  totalConfirmed: number;
  totalCheckedIn: number;
  participants: {
    id: string;
    name: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    checkedIn: boolean;
    checkedInAt?: string;
  }[];
}

const mockEvents: EventWithParticipants[] = [
  {
    id: '1',
    title: 'Conferência de Jovens 2026',
    date: '2026-02-15',
    totalConfirmed: 45,
    totalCheckedIn: 32,
    participants: [
      { id: '1', name: 'João Silva', status: 'confirmed', checkedIn: true, checkedInAt: '2026-02-15 09:30' },
      { id: '2', name: 'Maria Santos', status: 'confirmed', checkedIn: true, checkedInAt: '2026-02-15 09:45' },
      { id: '3', name: 'Pedro Costa', status: 'confirmed', checkedIn: false },
      { id: '4', name: 'Ana Oliveira', status: 'pending', checkedIn: false },
      { id: '5', name: 'Carlos Ferreira', status: 'cancelled', checkedIn: false },
    ],
  },
  {
    id: '2',
    title: 'Retiro de Casais',
    date: '2026-03-20',
    totalConfirmed: 30,
    totalCheckedIn: 0,
    participants: [
      { id: '6', name: 'Roberto Lima', status: 'confirmed', checkedIn: false },
      { id: '7', name: 'Sandra Lima', status: 'confirmed', checkedIn: false },
      { id: '8', name: 'Fernando Souza', status: 'pending', checkedIn: false },
    ],
  },
];

export default function EventsComplementPage() {
  const [events] = useState<EventWithParticipants[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventWithParticipants | null>(mockEvents[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);

  const handleCheckIn = (participantId: string) => {
    if (!selectedEvent) return;
    const updatedParticipants = selectedEvent.participants.map(p =>
      p.id === participantId ? { ...p, checkedIn: true, checkedInAt: new Date().toISOString() } : p
    );
    setSelectedEvent({ ...selectedEvent, participants: updatedParticipants });
  };

  const filteredParticipants = selectedEvent?.participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Eventos</h1>
            <p className="text-muted-foreground mt-1">
              Controle de presença, check-in e relatórios por evento
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowQRDialog(true)}>
              <QrCode className="w-4 h-4" />
              Check-in QR Code
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Event List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEvent?.id === event.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                >
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {event.totalConfirmed} confirmados
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Event Details */}
          <div className="lg:col-span-3 space-y-6">
            {selectedEvent && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedEvent.participants.filter(p => p.status === 'confirmed').length}</p>
                          <p className="text-sm text-muted-foreground">Confirmados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                          <UserCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedEvent.participants.filter(p => p.checkedIn).length}</p>
                          <p className="text-sm text-muted-foreground">Check-ins</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedEvent.participants.filter(p => p.status === 'pending').length}</p>
                          <p className="text-sm text-muted-foreground">Pendentes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Participants Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedEvent.title}</CardTitle>
                        <CardDescription>Lista de participantes e controle de presença</CardDescription>
                      </div>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar participante..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParticipants.map(participant => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-medium">{participant.name}</TableCell>
                            <TableCell>{getStatusBadge(participant.status)}</TableCell>
                            <TableCell>
                              {participant.checkedIn ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {participant.checkedInAt
                                ? new Date(participant.checkedInAt).toLocaleTimeString()
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={participant.checkedIn ? 'outline' : 'default'}
                                disabled={participant.checkedIn || participant.status === 'cancelled'}
                                onClick={() => handleCheckIn(participant.id)}
                              >
                                {participant.checkedIn ? 'Presente' : 'Check-in'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check-in por QR Code</DialogTitle>
              <DialogDescription>
                Use o leitor de QR Code para fazer check-in rápido dos participantes
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-muted-foreground" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                Fechar
              </Button>
              <Button>Abrir Leitor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
