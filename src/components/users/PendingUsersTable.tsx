
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, 
  X, 
  Mail, 
  Calendar,
  Building2,
  Clock
} from 'lucide-react';

const PendingUsersTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get units separately
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('id, name, code');

      if (unitsError) throw unitsError;

      // Combine the data manually
      const combinedData = profilesData?.map(profile => {
        const unit = unitsData?.find(u => u.id === profile.unit_id);
        
        return {
          ...profile,
          units: unit || null
        };
      }) || [];

      return combinedData;
    },
  });

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário aprovado',
        description: 'O usuário foi aprovado com sucesso.',
      });

      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['active-users'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário rejeitado',
        description: 'O usuário foi rejeitado.',
      });

      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o usuário.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Usuários Pendentes de Aprovação
        </CardTitle>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {pendingUsers?.length || 0} usuários aguardando aprovação
        </p>
      </CardHeader>
      <CardContent>
        {!pendingUsers || pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg w-fit mx-auto mb-3">
              <UserCheck className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Nenhum usuário pendente
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Todos os usuários foram processados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {user.full_name || 'Nome não informado'}
                      </h3>
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                        Pendente
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      
                      {user.units && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{user.units.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {user.position && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {user.position}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1 h-8"
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(user.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20 text-xs px-3 py-1 h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingUsersTable;
