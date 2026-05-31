import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  PlusCircle, 
  Download, 
  Upload,
  User,
  Calendar
} from 'lucide-react';
import { PrayerGuide, PrayerHistory, PrayerProgress } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrayerHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  history: PrayerHistory[];
  progress: PrayerProgress[];
}

export function PrayerHistoryDialog({ 
  open, 
  onOpenChange, 
  guide, 
  history,
  progress 
}: PrayerHistoryDialogProps) {
  const getActionIcon = (action: PrayerHistory['action']) => {
    switch (action) {
      case 'created':
        return <PlusCircle className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'downloaded_pdf':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'uploaded_pdf':
        return <Upload className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: PrayerHistory['action']) => {
    switch (action) {
      case 'created':
        return 'Guia criado';
      case 'completed':
        return 'Oração concluída';
      case 'downloaded_pdf':
        return 'PDF baixado';
      case 'uploaded_pdf':
        return 'PDF enviado';
      default:
        return action;
    }
  };

  const getActionBadgeVariant = (action: PrayerHistory['action']) => {
    switch (action) {
      case 'created':
        return 'default';
      case 'completed':
        return 'outline';
      case 'downloaded_pdf':
      case 'uploaded_pdf':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Combinar histórico e progresso
  const allActivities = [
    ...history.map(h => ({
      id: h.id,
      date: h.date,
      memberName: h.memberName,
      action: h.action,
      notes: h.notes,
      type: 'history' as const,
    })),
    ...progress.map(p => ({
      id: p.id,
      date: p.completedDate,
      memberName: p.memberName,
      action: 'completed' as const,
      notes: p.notes,
      type: 'progress' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Orações</DialogTitle>
          <DialogDescription>
            Histórico completo do guia "{guide?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{progress.length}</p>
              <p className="text-xs text-muted-foreground">Total de orações</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-success">
                {new Set(progress.map(p => p.memberId)).size}
              </p>
              <p className="text-xs text-muted-foreground">Participantes</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-500">
                {history.filter(h => h.action === 'downloaded_pdf').length}
              </p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
          </div>

          {/* Lista de atividades */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {allActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade registrada ainda.</p>
                </div>
              ) : (
                allActivities.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="mt-0.5">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getActionBadgeVariant(activity.action)}>
                          {getActionLabel(activity.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          por {activity.memberName}
                        </span>
                      </div>
                      {activity.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{activity.notes}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
