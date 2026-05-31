import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, GraduationCap, BookOpen, Users, Award, Edit, Trash2, CheckCircle, Play, FileText } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: { id: string; title: string; completed: boolean }[];
}

interface Student {
  id: string;
  name: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
}

const mockModules: Module[] = [
  {
    id: '1',
    title: 'Módulo 1: Fundamentos da Fé',
    description: 'Introdução aos princípios básicos da fé cristã',
    lessons: [
      { id: '1', title: 'O que é fé?', completed: true },
      { id: '2', title: 'A Bíblia como fundamento', completed: true },
      { id: '3', title: 'Conhecendo a Deus', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Módulo 2: A Igreja',
    description: 'Entendendo o corpo de Cristo',
    lessons: [
      { id: '4', title: 'O que é a Igreja?', completed: false },
      { id: '5', title: 'Nossa visão e missão', completed: false },
      { id: '6', title: 'Compromisso com a comunidade', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Módulo 3: Vida Cristã',
    description: 'Práticas para uma vida de fé',
    lessons: [
      { id: '7', title: 'Oração diária', completed: false },
      { id: '8', title: 'Estudo bíblico', completed: false },
      { id: '9', title: 'Servindo ao próximo', completed: false },
    ],
  },
];

const mockStudents: Student[] = [
  { id: '1', name: 'João Silva', progress: 67, startedAt: '2026-01-05' },
  { id: '2', name: 'Maria Santos', progress: 100, startedAt: '2025-12-10', completedAt: '2026-01-10' },
  { id: '3', name: 'Pedro Costa', progress: 33, startedAt: '2026-01-15' },
  { id: '4', name: 'Ana Oliveira', progress: 0, startedAt: '2026-01-18' },
];

export default function MembershipCoursePage() {
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const overallProgress = (completedLessons / totalLessons) * 100;

  const handleAddModule = () => {
    const module: Module = {
      id: Date.now().toString(),
      title: newModule.title,
      description: newModule.description,
      lessons: [],
    };
    setModules([...modules, module]);
    setIsAddModuleDialogOpen(false);
    setNewModule({ title: '', description: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Curso de Membresia</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o curso de membresia e acompanhe o progresso dos alunos
            </p>
          </div>
          <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Módulo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Módulo</DialogTitle>
                <DialogDescription>
                  Adicione um novo módulo ao curso de membresia
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título do Módulo</Label>
                  <Input
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    placeholder="Ex: Módulo 4: Evangelismo"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    placeholder="Descrição do módulo..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModuleDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddModule}>Criar Módulo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-sm text-muted-foreground">Módulos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLessons}</p>
                  <p className="text-sm text-muted-foreground">Aulas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Alunos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.filter(s => s.progress === 100).length}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Conteúdo do Curso</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {modules.map((module, idx) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{module.title}</p>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <Badge variant="outline">
                        {module.lessons.filter(l => l.completed).length}/{module.lessons.length} aulas
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 py-4">
                      {module.lessons.map((lesson, lessonIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            lesson.completed ? 'bg-green-500 text-white' : 'bg-muted-foreground/20'
                          }`}>
                            {lesson.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-sm">{lessonIdx + 1}</span>
                            )}
                          </div>
                          <span className={lesson.completed ? 'line-through text-muted-foreground' : ''}>
                            {lesson.title}
                          </span>
                          <div className="ml-auto flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Aula
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Iniciou em {new Date(student.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {student.progress === 100 ? (
                              <Badge className="bg-green-500 gap-1">
                                <Award className="w-3 h-3" />
                                Concluído
                              </Badge>
                            ) : (
                              <Badge variant="secondary">{student.progress}% completo</Badge>
                            )}
                          </div>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                      {student.progress === 100 && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Award className="w-4 h-4" />
                          Certificado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
