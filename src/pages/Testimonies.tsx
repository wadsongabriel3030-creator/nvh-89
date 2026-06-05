import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Heart, Eye, EyeOff, Edit, Trash2, Quote } from 'lucide-react';
import { format } from 'date-fns';
import { useTestimonies } from '@/contexts/TestimoniesContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Testimony } from '@/types';

export default function TestimoniesPage() {
  const navigate = useNavigate();
  const { testimonies, updateTestimony, deleteTestimony } = useTestimonies();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null);
  const [editForm, setEditForm] = useState({ authorName: '', title: '', content: '' });

  const handleDelete = (id: string) => {
    deleteTestimony(id);
  };

  const handleEditOpen = (testimony: Testimony) => {
    setEditingTestimony(testimony);
    setEditForm({
      authorName: testimony.authorName,
      title: testimony.title,
      content: testimony.content,
    });
  };

  const handleEditSave = async () => {
    if (!editingTestimony) return;
    await updateTestimony(editingTestimony.id, {
      authorName: editForm.authorName,
      title: editForm.title,
      content: editForm.content,
    });
    toast.success('Testimonio actualizado con éxito');
    setEditingTestimony(null);
  };

  const filteredTestimonies = testimonies.filter(t =>
    filter === 'all' || t.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprobado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Testimonios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administre los testimonios de los miembros
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/inscripcion-testimonio')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Testimonio</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:border-border ${filter === 'all' ? 'border-primary/50 bg-primary/5' : ''}`}
            onClick={() => setFilter('all')}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-foreground">{testimonies.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:border-border ${filter === 'pending' ? 'border-warning/50 bg-warning/5' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-warning">{testimonies.filter(t => t.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pendientes</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:border-border ${filter === 'approved' ? 'border-success/50 bg-success/5' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-success">{testimonies.filter(t => t.status === 'approved').length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Aprobados</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:border-border ${filter === 'rejected' ? 'border-destructive/50 bg-destructive/5' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-destructive">{testimonies.filter(t => t.status === 'rejected').length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rechazados</p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonies List */}
        <div className="space-y-3">
          {filteredTestimonies.map((testimony) => (
            <Card key={testimony.id} className="hover:border-border transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {testimony.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                          <Quote className="w-3.5 h-3.5 text-primary" />
                          {testimony.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          por {testimony.authorName} • {format(new Date(testimony.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(testimony.status)}
                        <Badge variant="outline" className="gap-1 text-xs">
                          {testimony.visibility === 'public' ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Público
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Interno
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{testimony.content}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="ghost" size="sm" className="gap-1 ml-auto" onClick={() => handleEditOpen(testimony)}>
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(testimony.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTestimonies.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <Heart className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-medium text-foreground">Ningún testimonio encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter !== 'all' ? 'Intente ajustar los filtros.' : 'Agregue el primer testimonio.'}
            </p>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTestimony} onOpenChange={(open) => { if (!open) setEditingTestimony(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Testimonio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Nombre del autor</Label>
                <Input
                  value={editForm.authorName}
                  onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contenido</Label>
                <Textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={8}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTestimony(null)}>Cancelar</Button>
              <Button onClick={handleEditSave}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}