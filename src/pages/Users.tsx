
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users as UsersIcon, Shield } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { SkeletonUsers } from '@/components/ui/skeleton-users';
import PendingUsersTable from '@/components/users/PendingUsersTable';
import ActiveUsersTable from '@/components/users/ActiveUsersTable';

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
    <div className="min-h-screen ">
      <div className="p-2 md:p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            Gerenciamento de Usuários
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gerencie aprovações de usuários e perfis do sistema
          </p>
        </div>

        {/* Tabs para separar usuários pendentes e ativos */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm border-0 shadow-sm">
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
            >
              <UserCheck className="h-4 w-4" />
              Usuários Pendentes
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
            >
              <UsersIcon className="h-4 w-4" />
              Usuários Ativos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <PendingUsersTable />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <ActiveUsersTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UsersPage;
