import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { User, Shield, Crown, Users, UserCheck } from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

interface UserRoleSwitcherProps {
  currentUser: CurrentUser;
  onSwitch: (user: CurrentUser) => void;
}

const mockUsers: CurrentUser[] = [
  { id: 'admin-1', name: 'Administrador', role: 'admin' },
  { id: 'pastor-1', name: 'Apóstol Silvio', role: 'pastor' },
  { id: 'leader-1', name: 'Líder Maria', role: 'leader' },
  { id: 'member-1', name: 'Membro Carlos', role: 'member' },
];

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  pastor: <Crown className="w-4 h-4" />,
  leader: <UserCheck className="w-4 h-4" />,
  server: <Users className="w-4 h-4" />,
  member: <User className="w-4 h-4" />,
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  pastor: 'Pastor',
  leader: 'Líder',
  server: 'Servidor',
  member: 'Membro',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  pastor: 'bg-primary text-primary-foreground',
  leader: 'bg-success text-success-foreground',
  server: 'bg-warning text-warning-foreground',
  member: 'bg-secondary text-secondary-foreground',
};

export function UserRoleSwitcher({ currentUser, onSwitch }: UserRoleSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {roleIcons[currentUser.role]}
          <span className="hidden sm:inline">{currentUser.name}</span>
          <Badge className={roleColors[currentUser.role]}>
            {roleLabels[currentUser.role]}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Trocar Perfil (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onSwitch(user)}
            className="gap-2"
          >
            {roleIcons[user.role]}
            <span className="flex-1">{user.name}</span>
            <Badge variant="outline" className="text-xs">
              {roleLabels[user.role]}
            </Badge>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          ⚠️ Apenas para demonstração.
          <br />
          Em produção, use autenticação.
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
