import { useState, useRef } from 'react';
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
import { PrayerGuide, PrayerGuidePDF } from '@/types';
import { FileText, Upload, X } from 'lucide-react';

interface AddPrayerGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PrayerGuide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function AddPrayerGuideDialog({ open, onOpenChange, onSubmit }: AddPrayerGuideDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    verses: '',
    period: 'daily' as 'daily' | 'weekly' | 'monthly',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<PrayerGuidePDF | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = () => {
        setPdfPreview({
          id: Date.now().toString(),
          name: file.name,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.startDate) return;

    onSubmit({
      title: formData.title,
      description: formData.description,
      verses: formData.verses.split(',').map(v => v.trim()).filter(Boolean),
      period: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      isActive: formData.isActive,
      pdfFile: pdfPreview || undefined,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      verses: '',
      period: 'daily',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setPdfFile(null);
    setPdfPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Guia de Oração</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo guia de oração para os membros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Jejum de Daniel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o propósito e instruções do guia de oração..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verses">Versículos (separados por vírgula)</Label>
            <Input
              id="verses"
              value={formData.verses}
              onChange={(e) => setFormData({ ...formData, verses: e.target.value })}
              placeholder="João 3:16, Salmos 23:1, Mateus 6:9-13"
            />
          </div>

          {/* Upload PDF */}
          <div className="space-y-2">
            <Label>Arquivo PDF (opcional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!pdfPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload de um PDF
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  O arquivo ficará disponível para download na página do guia
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pdfPreview.name}</p>
                  <p className="text-xs text-muted-foreground">
                    PDF anexado com sucesso
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePdf}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
              <Label htmlFor="startDate">Data Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="isActive">Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Guias inativos não aparecem para membros
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.description || !formData.startDate}>
            Criar Guia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
