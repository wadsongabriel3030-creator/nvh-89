import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Member } from '@/types';
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
import { useEffect } from 'react';

const memberSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  conversionDate: z.string().optional(),
  baptismDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'visitor']),
  role: z.enum(['admin', 'pastor', 'leader', 'server', 'member']),
  etapa: z.enum(['Adulto', 'Joven Adulto', 'Joven', 'Niño']).optional(),
  sexo: z.enum(['Hombre', 'Mujer']).optional(),
  zona: z.string().optional(),
  petitions: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: MemberFormData) => void;
}

export function EditMemberDialog({ member, open, onOpenChange, onSubmit }: EditMemberDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  useEffect(() => {
    if (member && open) {
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email || '',
        birthDate: member.birthDate || '',
        conversionDate: member.conversionDate || '',
        baptismDate: member.baptismDate || '',
        status: member.status,
        role: member.role,
        etapa: member.etapa || 'Adulto',
        sexo: member.sexo || 'Hombre',
        notes: member.notes || '',
        petitions: member.petitions || '',
        zona: member.zona || '',
      });
    }
  }, [member, open, reset]);

  const handleFormSubmit = (data: MemberFormData) => {
    if (member) {
      onSubmit(member.id, data);
      onOpenChange(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Miembro</DialogTitle>
          <DialogDescription>
            Actualice los datos de {member.firstName} {member.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
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
                defaultValue={member.etapa || 'Adulto'}
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
                defaultValue={member.sexo || 'Hombre'}
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
                defaultValue={member.status}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conversionDate">Fecha de Conversión</Label>
              <Input
                id="conversionDate"
                type="date"
                {...register('conversionDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baptismDate">Fecha de Bautismo</Label>
              <Input
                id="baptismDate"
                type="date"
                {...register('baptismDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Función</Label>
            <Select
              onValueChange={(value) => setValue('role', value as any)}
              defaultValue={member.role}
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
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}