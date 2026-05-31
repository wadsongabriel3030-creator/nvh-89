import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PrayerGuide } from '@/types';

interface EditPrayerGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  onSubmit: (id: string, data: Partial<PrayerGuide>) => void;
}

export function EditPrayerGuideDialog({ open, onOpenChange, guide, onSubmit }: EditPrayerGuideDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    verses: '',
    period: 'daily' as 'daily' | 'weekly' | 'monthly',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (guide) {
      setFormData({
        title: guide.title,
        description: guide.description,
        verses: guide.verses.join(', '),
        period: guide.period,
        startDate: guide.startDate,
        endDate: guide.endDate || '',
        isActive: guide.isActive,
      });
    }
  }, [guide]);

  const handleSubmit = () => {
    if (!guide || !formData.title || !formData.description) return;

    onSubmit(guide.id, {
      title: formData.title,
      description: formData.description,
      verses: formData.verses.split(',').map(v => v.trim()).filter(Boolean),
      period: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      isActive: formData.isActive,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Guia de Oração</DialogTitle>
          <DialogDescription>
            Atualize os dados do guia de oração.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Jejum de Daniel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o propósito e instruções do guia de oração..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-verses">Versículos (separados por vírgula)</Label>
            <Input
              id="edit-verses"
              value={formData.verses}
              onChange={(e) => setFormData({ ...formData, verses: e.target.value })}
              placeholder="João 3:16, Salmos 23:1, Mateus 6:9-13"
            />
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <Select
              value={formData.period}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                setFormData({ ...formData, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">📅 Diário</SelectItem>
                <SelectItem value="weekly">📆 Semanal</SelectItem>
                <SelectItem value="monthly">🗓️ Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Data Início *</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Data Fim (opcional)</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="edit-isActive">Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Guias inativos não aparecem para membros
              </p>
            </div>
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.description}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
