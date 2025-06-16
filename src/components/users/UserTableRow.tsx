
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Settings, UserCheck } from 'lucide-react';
import UserRoleManager from './UserRoleManager';

interface ActiveUser {
  id: string;
  full_name: string;
  email: string;
  status: string;
  position?: string;
  department?: string;
  created_at: string;
  role?: 'admin' | 'user' | 'supervisor';
}

interface UserTableRowProps {
  user: ActiveUser;
  onRoleChange: (userId: string, newRole: 'admin' | 'user' | 'supervisor') => void;
  onDeactivateUser: (userId: string, userEmail: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onRoleChange,
  onDeactivateUser
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'user':
        return 'Funcionário';
      default:
        return 'Funcionário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'supervisor':
        return <Settings className="h-3 w-3" />;
      case 'user':
        return <UserCheck className="h-3 w-3" />;
      default:
        return <UserCheck className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.full_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <div className="text-sm">
          {user.position && <div className="font-medium">{user.position}</div>}
          {user.department && <div className="text-gray-500">{user.department}</div>}
          {!user.position && !user.department && (
            <span className="text-gray-400">Não informado</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={getRoleBadgeColor(user.role || 'user')}>
          <span className="flex items-center gap-1">
            {getRoleIcon(user.role || 'user')}
            {getRoleLabel(user.role || 'user')}
          </span>
        </Badge>
      </TableCell>
      <TableCell>{formatDate(user.created_at)}</TableCell>
      <TableCell>
        <UserRoleManager
          userId={user.id}
          userEmail={user.email}
          userName={user.full_name}
          currentRole={user.role || 'user'}
          onRoleChange={onRoleChange}
          onDeactivateUser={onDeactivateUser}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
