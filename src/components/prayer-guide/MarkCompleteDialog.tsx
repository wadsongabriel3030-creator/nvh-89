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

interface MarkCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  onConfirm: (notes?: string) => void;
}

export function MarkCompleteDialog({ 
  open, 
  onOpenChange, 
  guide, 
  onConfirm 
}: MarkCompleteDialogProps) {
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
            Marcar Oração como Concluída
          </DialogTitle>
          <DialogDescription>
            Registre que você completou a oração do guia "{guide?.title}" hoje.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Parabéns!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manter uma vida de oração é fundamental para o crescimento espiritual.
              Continue firme!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Compartilhe algo sobre sua experiência de oração hoje..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Suas notas são privadas e ajudam a acompanhar seu progresso.
            </p>
          </div>

          {/* Versículos do guia */}
          {guide && guide.verses.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Versículos de hoje:</p>
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
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Conclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
