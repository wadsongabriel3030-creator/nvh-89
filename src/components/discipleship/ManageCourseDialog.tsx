import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, CheckCircle2, Circle, GraduationCap, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { CourseStudent } from './ViewStudentsDialog';

export interface CourseLesson {
  id: string;
  name: string;
}

interface ManageCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  lessons: CourseLesson[];
  students: CourseStudent[];
}

export function ManageCourseDialog({
  open,
  onOpenChange,
  courseName,
  lessons,
  students,
}: ManageCourseDialogProps) {
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<string>('lessons');
  // attendance[lessonId][studentId] = boolean
  const [attendance, setAttendance] = useState<Record<string, Record<string, boolean>>>({});

  const completedCount = useMemo(
    () => Object.values(completedLessons).filter(Boolean).length,
    [completedLessons]
  );
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const toggleAttendance = (lessonId: string, studentId: string) => {
    setAttendance((prev) => {
      const lessonAtt = { ...(prev[lessonId] ?? {}) };
      lessonAtt[studentId] = !lessonAtt[studentId];
      return { ...prev, [lessonId]: lessonAtt };
    });
  };

  const markAllPresent = () => {
    if (!selectedLessonId) return;
    setAttendance((prev) => ({
      ...prev,
      [selectedLessonId]: students.reduce<Record<string, boolean>>((acc, s) => {
        acc[s.id] = true;
        return acc;
      }, {}),
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Cambios guardados',
      description: `El progreso y la asistencia de "${courseName}" se han actualizado.`,
    });
    onOpenChange(false);
  };

  const lessonAttendance = attendance[selectedLessonId] ?? {};
  const presentCount = Object.values(lessonAttendance).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Gestionar - {courseName}
          </DialogTitle>
          <DialogDescription>
            Marque las clases completadas y la asistencia de los alumnos en cada clase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progreso general del curso ({completedCount}/{lessons.length} clases)
            </span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="w-4 h-4" /> Clases
            </TabsTrigger>
            <TabsTrigger value="attendance" disabled className="gap-2">
              <Users className="w-4 h-4" /> Asistencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4">
            <ScrollArea className="h-[50vh] pr-4">
              {lessons.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No hay clases registradas.
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => {
                    const completed = !!completedLessons[lesson.id];
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setActiveTab('attendance');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonComplete(lesson.id);
                            }}
                            className="flex-shrink-0"
                            aria-label="Marcar clase"
                          >
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <div>
                            <p className="text-xs text-muted-foreground">Clase {idx + 1}</p>
                            <p className="font-medium text-foreground">{lesson.name}</p>
                          </div>
                        </div>
                        {completed && (
                          <Badge className="bg-success/15 text-success border-0">
                            Completada
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccione una clase" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((l, idx) => (
                    <SelectItem key={l.id} value={l.id}>
                      Clase {idx + 1} - {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={markAllPresent} disabled={!selectedLessonId}>
                Marcar todos
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {presentCount} de {students.length} alumnos presentes
            </div>

            <ScrollArea className="h-[40vh] pr-4">
              {students.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No hay alumnos matriculados.
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => {
                    const present = !!lessonAttendance[student.id];
                    return (
                      <label
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={present}
                            onCheckedChange={() => toggleAttendance(selectedLessonId, student.id)}
                          />
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                        {present && (
                          <Badge className="bg-success/15 text-success border-0">Presente</Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
