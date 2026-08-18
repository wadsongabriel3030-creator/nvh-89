import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookOpen, Users, Award, Clock, Plus, ClipboardList, UserPlus, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ManageCourseDialog, CourseLesson } from '@/components/discipleship/ManageCourseDialog';
import { ViewStudentsDialog, CourseStudent } from '@/components/discipleship/ViewStudentsDialog';
import { AddStudentDialog } from '@/components/discipleship/AddStudentDialog';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';

interface CourseData {
  id: string;
  name: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  students: number;
  progress: number;
  lessons: CourseLesson[];
  studentList: CourseStudent[];
}

const makeLessons = (titles: string[]): CourseLesson[] =>
  titles.map((name, i) => ({ id: `l${i + 1}`, name }));

const courses: CourseData[] = [
  {
    id: '3',
    name: 'Administración',
    slug: 'administracion',
    description: 'Mayordomía y administración de recursos',
    level: 'intermediate',
    duration: '10 semanas',
    students: 0,
    progress: 0,
    lessons: makeLessons(['La Administración', 'Práctica']),
    studentList: [],
  },
  {
    id: '4',
    name: 'La Familia',
    slug: 'la-familia',
    description: 'Principios bíblicos para la familia',
    level: 'advanced',
    duration: '12 semanas',
    students: 0,
    progress: 0,
    lessons: makeLessons(['La Familia', 'Seminario Familiar']),
    studentList: [],
  },
  {
    id: '5',
    name: 'Creencias Básicas',
    slug: 'creencias-basicas',
    description: 'Fundamentos doctrinales de la fe cristiana',
    level: 'advanced',
    duration: '10 lecciones',
    students: 0,
    progress: 0,
    lessons: makeLessons(['Creencias Básicas de la Cristiandad', 'Práctica']),
    studentList: [],
  },
];

const levelColors: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Principiante' },
  intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Intermedio' },
  advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Avanzado' },
};

const STORAGE_KEY = 'discipleship-courses-v1';

export default function NivelI() {
  const navigate = useNavigate();
  const [manageCourse, setManageCourse] = useState<CourseData | null>(null);
  const [viewStudentsCourse, setViewStudentsCourse] = useState<CourseData | null>(null);
  const [addStudentCourse, setAddStudentCourse] = useState<CourseData | null>(null);
  const [coursesState, setCoursesState] = useState<CourseData[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, CourseStudent[]>;
        const isMockStudent = (s: CourseStudent) =>
          s.email?.endsWith('@email.com') && /^[a-záéíóúñü.]+@email\.com$/i.test(s.email);
        return courses.map((c) => {
          const savedList = saved[c.id];
          if (Array.isArray(savedList)) {
            const cleanList = savedList.filter((s) => !isMockStudent(s));
            return { ...c, studentList: cleanList, students: cleanList.length };
          }
          return c;
        });
      }
    } catch {}
    return courses;
  });

  const totalClasses = coursesState.length;
  const totalStudents = coursesState.reduce((sum, c) => sum + c.studentList.length, 0);
  const avgProgress = totalStudents > 0
    ? Math.round(coursesState.reduce((sum, c) => sum + c.progress, 0) / coursesState.length)
    : 0;

  useEffect(() => {
    try {
      const payload = coursesState.reduce<Record<string, CourseStudent[]>>((acc, c) => {
        acc[c.id] = c.studentList;
        return acc;
      }, {});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [coursesState]);

  const handleAddStudents = (courseId: string, newStudents: CourseStudent[]) => {
    setCoursesState((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const existingIds = new Set(c.studentList.map((s) => s.id));
        const toAdd = newStudents.filter((s) => !existingIds.has(s.id));
        const merged = [...c.studentList, ...toAdd];
        return { ...c, studentList: merged, students: merged.length };
      })
    );
    notifyMemberProgressUpdated();
  };

  const goToReporte = (course: CourseData) => {
    try {
      sessionStorage.setItem(
        `discipulado-students-${course.slug}`,
        JSON.stringify(course.studentList)
      );
    } catch {}
    navigate(`/reporte-discipulado?curso=${course.slug}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <GraduationCap className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <button
                  onClick={() => navigate('/escuela-equipamiento')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Escuela de Equipamiento
                </button>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-foreground font-medium">Nivel I</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Nivel I</h1>
              <p className="text-muted-foreground">
                Gestione clases y siga el progreso de los alumnos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/reporte-discipulado')}>
              <ClipboardList className="w-4 h-4" />
              Reporte Discipulado
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Clase
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
                <p className="text-sm text-muted-foreground">Clases activas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Alumnos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
                <p className="text-sm text-muted-foreground">Progreso promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Nivel I</p>
                <p className="text-sm text-muted-foreground">Módulo activo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesState.map((course, index) => {
            const level = levelColors[course.level];
            return (
              <Card
                key={course.id}
                className="hover:shadow-soft transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-xl break-words">{course.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs sm:text-sm break-words">{course.description}</CardDescription>
                    </div>
                    <Badge className={cn('border-0 text-[10px] sm:text-xs shrink-0', level.bg, level.text)}>
                      {level.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{course.students} alumnos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progreso de la clase</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewStudentsCourse(course)}
                      className="text-xs sm:text-sm min-w-0 w-full"
                    >
                      <span className="truncate">Ver alumnos</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs sm:text-sm min-w-0 w-full"
                      onClick={() => setAddStudentCourse(course)}
                    >
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span className="truncate">Agregar alumno</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs sm:text-sm min-w-0 w-full"
                      onClick={() => goToReporte(course)}
                    >
                      <ClipboardList className="w-4 h-4 shrink-0" />
                      <span className="truncate">Reporte</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {manageCourse && (
        <ManageCourseDialog
          open={!!manageCourse}
          onOpenChange={(open) => !open && setManageCourse(null)}
          courseName={manageCourse.name}
          lessons={manageCourse.lessons}
          students={manageCourse.studentList}
        />
      )}

      {viewStudentsCourse && (
        <ViewStudentsDialog
          open={!!viewStudentsCourse}
          onOpenChange={(open) => !open && setViewStudentsCourse(null)}
          courseName={viewStudentsCourse.name}
          students={viewStudentsCourse.studentList}
        />
      )}

      {addStudentCourse && (
        <AddStudentDialog
          open={!!addStudentCourse}
          onOpenChange={(open) => !open && setAddStudentCourse(null)}
          courseName={addStudentCourse.name}
          enrolledStudentIds={
            coursesState.find((c) => c.id === addStudentCourse.id)?.studentList.map((s) => s.id) ?? []
          }
          onAdd={(students) => handleAddStudents(addStudentCourse.id, students)}
        />
      )}
    </MainLayout>
  );
}
