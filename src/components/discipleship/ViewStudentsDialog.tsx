import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

export interface CourseStudent {
  id: string;
  name: string;
  email?: string;
  attendanceRate?: number;
}

interface ViewStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  students: CourseStudent[];
}

export function ViewStudentsDialog({
  open,
  onOpenChange,
  courseName,
  students,
}: ViewStudentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Alumnos - {courseName}
          </DialogTitle>
          <DialogDescription>
            {students.length} alumno{students.length !== 1 ? 's' : ''} matriculado{students.length !== 1 ? 's' : ''} en este curso
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {students.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aún no hay alumnos matriculados.
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      {student.email && (
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      )}
                    </div>
                  </div>
                  {typeof student.attendanceRate === 'number' && (
                    <Badge variant="secondary">
                      {student.attendanceRate}% asistencia
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
