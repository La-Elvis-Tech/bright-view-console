
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Info } from 'lucide-react';

const InviteCodeDisplay = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-500" />
          Sistema de Cadastro Aberto
        </CardTitle>
        <CardDescription>
          Agora qualquer pessoa pode se cadastrar e aguardar aprovação do administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Como funciona o novo sistema:
            </h4>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Usuários podem se cadastrar livremente na página de registro</li>
              <li>2. Novos usuários ficam com status "Pendente" até aprovação</li>
              <li>3. Administradores aprovam ou rejeitam usuários na aba "Usuários"</li>
              <li>4. Após aprovação, o usuário pode fazer login normalmente</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Nota:</strong> Os códigos de convite foram removidos em favor de um sistema mais simples 
            de aprovação manual. Isso garante mais controle sobre quem acessa o sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteCodeDisplay;
