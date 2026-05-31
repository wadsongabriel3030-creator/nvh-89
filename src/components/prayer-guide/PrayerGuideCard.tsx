import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  Clock,
  FileText,
  Eye
} from 'lucide-react';
import { PrayerGuide, PrayerProgress } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrayerGuideCardProps {
  guide: PrayerGuide;
  progress: PrayerProgress[];
  hasCompletedToday: boolean;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUploadPDF: () => void;
  onDownloadPDF: () => void;
  onMarkComplete: () => void;
  onViewHistory: () => void;
}

export function PrayerGuideCard({
  guide,
  progress,
  hasCompletedToday,
  canManage,
  onEdit,
  onDelete,
  onUploadPDF,
  onDownloadPDF,
  onMarkComplete,
  onViewHistory,
}: PrayerGuideCardProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return period;
    }
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '📅';
    }
  };

  // Calcular progresso baseado no período
  const calculateProgress = () => {
    if (!guide.startDate) return 0;
    
    const start = new Date(guide.startDate);
    const end = guide.endDate ? new Date(guide.endDate) : new Date();
    const now = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const completedDays = progress.length;
    
    return Math.min(Math.round((completedDays / totalDays) * 100), 100);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="line-clamp-1">{guide.title}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
          </div>
          <Badge variant={guide.isActive ? 'default' : 'secondary'} className="shrink-0">
            {guide.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Período e Datas */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{getPeriodIcon(guide.period)} {getPeriodLabel(guide.period)}</span>
          </div>
          {guide.startDate && (
            <span className="text-muted-foreground text-xs">
              {format(new Date(guide.startDate), "dd/MM/yyyy", { locale: ptBR })}
              {guide.endDate && ` - ${format(new Date(guide.endDate), "dd/MM/yyyy", { locale: ptBR })}`}
            </span>
          )}
        </div>

        {/* Versículos */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Versículos:</p>
          <div className="flex flex-wrap gap-1">
            {guide.verses.slice(0, 4).map((verse, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {verse}
              </Badge>
            ))}
            {guide.verses.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{guide.verses.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress.length} orações</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* PDF Status */}
        {guide.pdfFile && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {guide.pdfFile.name}
            </span>
            <Button variant="ghost" size="sm" onClick={onDownloadPDF}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Status de conclusão hoje */}
        {hasCompletedToday && (
          <div className="flex items-center gap-2 p-2 bg-success/10 text-success rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Oração concluída hoje!</span>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2">
          {!hasCompletedToday && guide.isActive && (
            <Button 
              size="sm" 
              className="flex-1 gap-1"
              onClick={onMarkComplete}
            >
              <CheckCircle2 className="w-4 h-4" />
              Marcar Concluída
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={onViewHistory}
          >
            <Eye className="w-4 h-4" />
            Histórico
          </Button>

          {canManage && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={onUploadPDF}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
