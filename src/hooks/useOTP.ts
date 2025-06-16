
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Funções desabilitadas - sistema agora usa confirmação por email padrão do Supabase
  const generateOTP = async (email: string, type: 'login' | 'signup' | 'password_reset' = 'login') => {
    toast({
      title: 'Sistema Atualizado',
      description: 'OTP não é mais necessário. Use a confirmação por email padrão.',
      variant: 'default',
    });
    return null;
  };

  const verifyOTP = async (email: string, code: string, type: 'login' | 'signup' | 'password_reset' = 'login') => {
    toast({
      title: 'Sistema Atualizado',
      description: 'Verificação OTP foi substituída por confirmação de email padrão.',
      variant: 'default',
    });
    return false;
  };

  return {
    loading,
    generateOTP,
    verifyOTP,
  };
};
