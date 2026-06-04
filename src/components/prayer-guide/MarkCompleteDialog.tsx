import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { PrayerGuide } from '@/types';
import { getPrayerGuideI18n, PrayerGuideLocale } from '@/components/prayer-guide/i18n';

interface MarkCompleteDialogProps {
  locale?: PrayerGuideLocale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  onConfirm: (notes?: string) => void;
}

export function MarkCompleteDialog({ 
  locale = 'pt',
  open, 
  onOpenChange, 
  guide, 
  onConfirm 
}: MarkCompleteDialogProps) {
  const t = getPrayerGuideI18n(locale);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes || undefined);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            {t.markCompleteDialog.title}
          </DialogTitle>
          <DialogDescription>
            {guide?.title ? t.markCompleteDialog.description(guide.title) : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-success" />
              <span className="font-medium text-success">{t.markCompleteDialog.congrats}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.markCompleteDialog.congratsBody}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.markCompleteDialog.notesLabel}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.markCompleteDialog.notesPlaceholder}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t.markCompleteDialog.notesHint}
            </p>
          </div>

          {/* Versículos do guia */}
          {guide && guide.verses.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">{t.markCompleteDialog.versesToday}</p>
              <div className="flex flex-wrap gap-1">
                {guide.verses.map((verse, idx) => (
                  <span key={idx} className="text-xs text-primary">
                    {verse}{idx < guide.verses.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.markCompleteDialog.cancel}
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {t.markCompleteDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
