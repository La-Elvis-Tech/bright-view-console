
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users as UsersIcon, Shield } from 'lucide-react';
import PendingUsersTable from '@/components/users/PendingUsersTable';
import ActiveUsersTable from '@/components/users/ActiveUsersTable';
import { useAuthContext } from '@/context/AuthContext';
import { SkeletonUsers } from '@/components/ui/skeleton-users';

const UsersPage = () => {
  const { isAdmin, user } = useAuthContext();

  // Show loading skeleton while checking auth
  if (!user) {
    return <SkeletonUsers />;
  }

  // Verificar se o usuário é admin antes de permitir acesso
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-500" />
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie aprovações de usuários e perfis</p>
      </div>

      {/* Tabs para separar usuários pendentes e ativos */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Usuários Pendentes
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Usuários Ativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <PendingUsersTable />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <ActiveUsersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
