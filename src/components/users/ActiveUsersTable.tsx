
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserTableRow from './UserTableRow';

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

const ActiveUsersTable = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(role => role.user_id === profile.id)?.role || 'user'
      })) || [];

      setActiveUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Erro ao buscar usuários ativos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários ativos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user' | 'supervisor') => {
    try {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: 'Role atualizada!',
        description: `Usuário agora tem o papel de ${newRole === 'admin' ? 'Administrador' : newRole === 'supervisor' ? 'Supervisor' : 'Funcionário'}.`,
      });

      fetchActiveUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a role do usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateUser = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário desativado',
        description: `${userEmail} foi desativado e não poderá mais acessar o sistema.`,
      });

      fetchActiveUsers();
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o usuário.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-500" />
          Usuários Ativos ({activeUsers.length})
        </CardTitle>
        <CardDescription>
          Usuários com acesso ao sistema e gerenciamento de funções
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeUsers.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário ativo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo/Departamento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onDeactivateUser={handleDeactivateUser}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveUsersTable;
