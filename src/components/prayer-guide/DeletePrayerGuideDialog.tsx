import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PrayerGuide } from '@/types';
import { getPrayerGuideI18n, PrayerGuideLocale } from '@/components/prayer-guide/i18n';

interface DeletePrayerGuideDialogProps {
  locale?: PrayerGuideLocale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: PrayerGuide | null;
  onConfirm: () => void;
}

export function DeletePrayerGuideDialog({ 
  locale = 'pt',
  open, 
  onOpenChange, 
  guide, 
  onConfirm 
}: DeletePrayerGuideDialogProps) {
  const t = getPrayerGuideI18n(locale);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {guide?.title ? t.deleteDialog.description(guide.title) : ''}
            <br /><br />
            {t.deleteDialog.warning}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.deleteDialog.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t.deleteDialog.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
