import { useState } from 'react';
import { useDbStorage } from '@/hooks/useDbStorage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, Church, HandHeart, Star, Edit, Trash2, Calendar } from 'lucide-react';
import { ServiceComment } from '@/types';
import { format } from 'date-fns';

const mockComments: ServiceComment[] = [
  {
    id: '1',
    type: 'culto',
    referenceId: '1',
    referenceName: 'Culto Dominical - 19/01',
    authorId: '1',
    authorName: 'João Silva',
    content: 'Culto muito abençoado! A palavra ministrada tocou meu coração. A equipe de louvor estava excelente.',
    date: '2026-01-19',
    isHighlighted: true,
    createdAt: '2026-01-19T12:00:00',
  },
  {
    id: '2',
    type: 'plc',
    referenceId: '2',
    referenceName: 'PLC Família Santos',
    authorId: '2',
    authorName: 'Maria Santos',
    content: 'Nossa reunião foi muito produtiva. Estudamos sobre fé e todos participaram ativamente.',
    date: '2026-01-18',
    isHighlighted: false,
    createdAt: '2026-01-18T21:00:00',
  },
  {
    id: '3',
    type: 'culto',
    referenceId: '3',
    referenceName: 'Culto de Oração - 15/01',
    authorId: '3',
    authorName: 'Pedro Costa',
    content: 'Experiência poderosa de oração. Muitas pessoas foram ministradas e tocadas pelo Espírito Santo.',
    date: '2026-01-15',
    isHighlighted: true,
    createdAt: '2026-01-15T20:00:00',
  },
];

const services = [
  { id: '1', name: 'Culto Dominical - 19/01', type: 'culto' },
  { id: '2', name: 'Culto de Oração - 15/01', type: 'culto' },
  { id: '3', name: 'Culto de Jovens - 12/01', type: 'culto' },
];

const plcs = [
  { id: '1', name: 'PLC Família Santos' },
  { id: '2', name: 'PLC Jovens Centro' },
  { id: '3', name: 'PLC Mulheres de Fé' },
];

export default function ServiceCommentsPage() {
  const { value: comments, setValue: setComments } = useDbStorage<ServiceComment[]>('service_comments_list', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'culto' | 'plc'>('all');
  const [newComment, setNewComment] = useState({
    type: 'culto' as 'culto' | 'plc',
    referenceId: '',
    referenceName: '',
    content: '',
    authorName: '',
  });

  const handleAddComment = () => {
    const comment: ServiceComment = {
      id: Date.now().toString(),
      type: newComment.type,
      referenceId: newComment.referenceId,
      referenceName: newComment.referenceName,
      authorId: Date.now().toString(),
      authorName: newComment.authorName,
      content: newComment.content,
      date: new Date().toISOString().split('T')[0],
      isHighlighted: false,
      createdAt: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setIsAddDialogOpen(false);
    setNewComment({ type: 'culto', referenceId: '', referenceName: '', content: '', authorName: '' });
  };

  const handleDelete = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const handleToggleHighlight = (id: string) => {
    setComments(comments.map(c =>
      c.id === id ? { ...c, isHighlighted: !c.isHighlighted } : c
    ));
  };

  const filteredComments = comments.filter(c =>
    activeTab === 'all' || c.type === activeTab
  );

  const handleServiceSelect = (value: string) => {
    const service = [...services, ...plcs.map(p => ({ ...p, type: 'plc' as const }))].find(s => s.id === value);
    if (service) {
      const serviceType: 'culto' | 'plc' = 'type' in service && service.type === 'culto' ? 'culto' : 'plc';
      setNewComment({
        ...newComment,
        referenceId: value,
        referenceName: service.name,
        type: serviceType,
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comentários</h1>
            <p className="text-muted-foreground mt-1">
              Comentários sobre cultos e reuniões de PLC
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Comentário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Comentário</DialogTitle>
                <DialogDescription>
                  Registre um comentário sobre um culto ou PLC
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={newComment.type}
                    onValueChange={(value: 'culto' | 'plc') => setNewComment({ ...newComment, type: value, referenceId: '', referenceName: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="culto">
                        <div className="flex items-center gap-2">
                          <Church className="w-4 h-4" />
                          Culto
                        </div>
                      </SelectItem>
                      <SelectItem value="plc">
                        <div className="flex items-center gap-2">
                          <HandHeart className="w-4 h-4" />
                          PLC
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{newComment.type === 'culto' ? 'Culto' : 'PLC'}</Label>
                  <Select
                    value={newComment.referenceId}
                    onValueChange={handleServiceSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(newComment.type === 'culto' ? services : plcs).map(item => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Seu Nome</Label>
                  <Input
                    value={newComment.authorName}
                    onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label>Comentário</Label>
                  <Textarea
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    placeholder="Escreva seu comentário..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddComment}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Todos ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="culto" className="gap-2">
              <Church className="w-4 h-4" />
              Cultos ({comments.filter(c => c.type === 'culto').length})
            </TabsTrigger>
            <TabsTrigger value="plc" className="gap-2">
              <HandHeart className="w-4 h-4" />
              PLCs ({comments.filter(c => c.type === 'plc').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className={comment.isHighlighted ? 'border-primary bg-primary/5' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {comment.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {comment.type === 'culto' ? (
                            <Church className="w-3 h-3" />
                          ) : (
                            <HandHeart className="w-3 h-3" />
                          )}
                          <span>{comment.referenceName}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(comment.date), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={comment.type === 'culto' ? 'default' : 'secondary'}>
                          {comment.type === 'culto' ? 'Culto' : 'PLC'}
                        </Badge>
                        {comment.isHighlighted && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-foreground">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-1 ${comment.isHighlighted ? 'text-yellow-500' : ''}`}
                        onClick={() => handleToggleHighlight(comment.id)}
                      >
                        <Star className={`w-4 h-4 ${comment.isHighlighted ? 'fill-yellow-500' : ''}`} />
                        {comment.isHighlighted ? 'Destacado' : 'Destacar'}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 ml-auto">
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComments.length === 0 && (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum comentário encontrado</h3>
            <p className="text-muted-foreground">Adicione o primeiro comentário.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
