
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthErrorAlertProps {
  error: string;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ error }) => {
  const getErrorMessage = (error: string) => {
    if (error.includes('pending')) {
      return {
        title: 'Conta Pendente',
        message: 'Sua conta está aguardando aprovação de um administrador. Você será notificado por email quando for aprovada.',
        variant: 'default' as const
      };
    }
    
    if (error.includes('desativada') || error.includes('inactive')) {
      return {
        title: 'Conta Desativada',
        message: 'Sua conta foi desativada. Entre em contato com um administrador para reativar.',
        variant: 'destructive' as const
      };
    }
    
    if (error.includes('não encontrado')) {
      return {
        title: 'Usuário Não Encontrado',
        message: 'Este email não está cadastrado no sistema. Verifique o email ou cadastre-se.',
        variant: 'destructive' as const
      };
    }
    
    return {
      title: 'Erro de Autenticação',
      message: error,
      variant: 'destructive' as const
    };
  };

  const { title, message, variant } = getErrorMessage(error);

  return (
    <Alert variant={variant}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div>
          <strong>{title}:</strong> {message}
        </div>
      </AlertDescription>
    </Alert>
  );
};
