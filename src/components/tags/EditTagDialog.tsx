import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag, TagCategory } from '@/types';

interface EditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
  onSave: (id: string, updates: Partial<Tag>) => void;
}

const categoryOptions: { value: TagCategory; label: string }[] = [
  { value: 'discipleship', label: 'Discipulado' },
  { value: 'nuevos_comienzos', label: 'Nuevos Comienzos' },
  { value: 'server', label: 'Servidores' },
  { value: 'plc', label: 'PLC' },
  { value: 'custom', label: 'Personalizadas' },
];

const colorOptions = [
  { value: 'bg-emerald-500', label: 'Verde', class: 'bg-emerald-500' },
  { value: 'bg-blue-500', label: 'Azul', class: 'bg-blue-500' },
  { value: 'bg-purple-500', label: 'Morado', class: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'bg-orange-500', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'bg-amber-500', label: 'Ámbar', class: 'bg-amber-500' },
  { value: 'bg-indigo-500', label: 'Índigo', class: 'bg-indigo-500' },
  { value: 'bg-red-500', label: 'Rojo', class: 'bg-red-500' },
  { value: 'bg-teal-500', label: 'Verde azulado', class: 'bg-teal-500' },
  { value: 'bg-cyan-500', label: 'Cian', class: 'bg-cyan-500' },
];

export function EditTagDialog({ open, onOpenChange, tag, onSave }: EditTagDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TagCategory>('custom');
  const [color, setColor] = useState('bg-emerald-500');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setCategory(tag.category);
      setColor(tag.color);
      setDescription(tag.description || '');
    }
  }, [tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag) return;

    onSave(tag.id, {
      name: name.trim(),
      category,
      color,
      description: description.trim() || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Etiqueta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la etiqueta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TagCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-8 h-8 rounded-full ${option.class} transition-all ${
                    color === option.value
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción (opcional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la etiqueta"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}