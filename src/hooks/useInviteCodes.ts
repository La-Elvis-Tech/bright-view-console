
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface mantida para compatibilidade, mas não mais usada
export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  is_active: boolean;
  role: 'admin' | 'user' | 'supervisor';
  metadata: any;
  created_at: string;
  used_at?: string;
}

export const useInviteCodes = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Funções desabilitadas - sistema agora usa aprovação manual
  const validateInviteCode = async (code: string) => {
    toast({
      title: 'Sistema Atualizado',
      description: 'Códigos de convite não são mais necessários. Cadastre-se livremente e aguarde aprovação.',
      variant: 'default',
    });
    return { valid: false, message: 'Sistema de códigos de convite desabilitado' };
  };

  const useInviteCode = async (code: string, userId: string) => {
    return false;
  };

  const generateInviteCode = async (
    role: 'admin' | 'user' | 'supervisor' = 'user',
    maxUses: number = 1,
    expiresHours: number = 168
  ) => {
    toast({
      title: 'Sistema Atualizado',
      description: 'Códigos de convite foram substituídos por aprovação manual de usuários.',
      variant: 'default',
    });
    return null;
  };

  const fetchInviteCodes = async () => {
    return [];
  };

  return {
    loading,
    validateInviteCode,
    useInviteCode,
    generateInviteCode,
    fetchInviteCodes,
  };
};
