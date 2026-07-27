import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const memberSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'visitor']),
  role: z.enum(['pastor', 'leader', 'server', 'member']),
  etapa: z.enum(['Adulto', 'Joven Adulto', 'Joven', 'Niño']).optional(),
  sexo: z.enum(['Hombre', 'Mujer']).optional(),
  zona: z.string().optional(),
  petitions: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MemberFormData) => void;
}

export function AddMemberDialog({ open, onOpenChange, onSubmit }: AddMemberDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      status: 'active',
      role: 'member',
      etapa: 'Adulto',
      sexo: 'Hombre',
    },
  });

  const handleFormSubmit = (data: MemberFormData) => {
    onSubmit(data);
    toast({
      title: '¡Miembro agregado!',
      description: `${data.firstName} ${data.lastName} fue registrado exitosamente.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Miembro</DialogTitle>
          <DialogDescription>
            Complete los datos para registrar un nuevo miembro en la iglesia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="García"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+502 5202-3805"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="juan@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa</Label>
              <Select
                onValueChange={(value) => setValue('etapa', value as any)}
                defaultValue="Adulto"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Joven Adulto">Joven Adulto</SelectItem>
                  <SelectItem value="Joven">Joven</SelectItem>
                  <SelectItem value="Niño">Niño</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                onValueChange={(value) => setValue('sexo', value as any)}
                defaultValue="Hombre"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue="active"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Miembro</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="visitor">Invitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zona">Zona y/o Municipio donde vive</Label>
            <Input
              id="zona"
              {...register('zona')}
              placeholder="Ej: Zona 1, Mixco, Villa Nueva..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Función</Label>
            <Select
              onValueChange={(value) => setValue('role', value as any)}
              defaultValue="member"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="server">Servidor</SelectItem>
                <SelectItem value="leader">Líder</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="petitions">Petición</Label>
            <Textarea
              id="petitions"
              {...register('petitions')}
              placeholder="Pedidos de oración, necesidades..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Información adicional..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}