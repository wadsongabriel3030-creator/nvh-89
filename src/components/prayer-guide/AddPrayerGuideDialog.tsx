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
import { getPrayerGuideI18n, PrayerGuideLocale } from '@/components/prayer-guide/i18n';

interface AddPrayerGuideDialogProps {
  locale?: PrayerGuideLocale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PrayerGuide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function AddPrayerGuideDialog({ locale = 'pt', open, onOpenChange, onSubmit }: AddPrayerGuideDialogProps) {
  const t = getPrayerGuideI18n(locale);
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
          <DialogTitle>{t.addDialog.title}</DialogTitle>
          <DialogDescription>
            {t.addDialog.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.addDialog.titleLabel}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t.addDialog.titlePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.addDialog.descriptionLabel}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.addDialog.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verses">{t.addDialog.versesLabel}</Label>
            <Input
              id="verses"
              value={formData.verses}
              onChange={(e) => setFormData({ ...formData, verses: e.target.value })}
              placeholder={t.addDialog.versesPlaceholder}
            />
          </div>

          {/* Upload PDF */}
          <div className="space-y-2">
            <Label>{t.addDialog.pdfLabel}</Label>
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
                  {t.addDialog.pdfUploadHint}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {t.addDialog.pdfUploadSubhint}
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
                    {t.addDialog.pdfAttached}
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
            <Label>{t.addDialog.periodLabel}</Label>
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
                <SelectItem value="daily">📅 {t.card.periodDaily}</SelectItem>
                <SelectItem value="weekly">📆 {t.card.periodWeekly}</SelectItem>
                <SelectItem value="monthly">🗓️ {t.card.periodMonthly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t.addDialog.startDateLabel}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t.addDialog.endDateLabel}</Label>
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
              <Label htmlFor="isActive">{t.addDialog.activeLabel}</Label>
              <p className="text-sm text-muted-foreground">
                {t.addDialog.activeHint}
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
            {t.addDialog.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.description || !formData.startDate}>
            {t.addDialog.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
