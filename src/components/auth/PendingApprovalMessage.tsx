
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mail, CheckCircle } from 'lucide-react';

interface PendingApprovalMessageProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ 
  userEmail, 
  onSignOut 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 dark:bg-neutral-900/90 border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Aguardando Aprovação
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            Sua conta foi criada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cadastro realizado!</strong> Sua conta foi criada e está aguardando aprovação de um administrador.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Email confirmado
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Aprovação pendente
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Um administrador irá revisar sua solicitação
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 pt-4">
            <p>Você será notificado por email quando sua conta for aprovada.</p>
            <p className="mt-2">Em caso de dúvidas, entre em contato com o suporte.</p>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full mt-4 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
            >
              Sair e tentar com outra conta
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
