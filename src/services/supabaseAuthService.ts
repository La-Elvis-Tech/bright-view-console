
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  position?: string;
  department?: string;
  role?: 'admin' | 'user' | 'supervisor';
}

export const supabaseAuthService = {
  async signIn(email: string, password: string) {
    console.log(`[AUTH] Tentativa de login para: ${email}`);
    
    // Verificar status do usuário ANTES do login
    const { data: profileData } = await supabase
      .from('profiles')
      .select('status, full_name')
      .eq('email', email)
      .single();

    if (!profileData) {
      console.log(`[AUTH] Usuário não encontrado: ${email}`);
      throw new Error('Usuário não encontrado no sistema.');
    }

    if (profileData.status === 'pending') {
      console.log(`[AUTH] Login negado - conta pendente: ${email}`);
      throw new Error('Sua conta ainda está pendente de aprovação. Aguarde a aprovação de um administrador.');
    }

    if (profileData.status === 'inactive') {
      console.log(`[AUTH] Login negado - conta desativada: ${email}`);
      throw new Error('Sua conta foi desativada. Entre em contato com um administrador.');
    }

    // Só permite login se status for 'active'
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`[AUTH] Erro no login para ${email}: ${error.message}`);
      throw new Error(error.message);
    }

    console.log(`[AUTH] Login bem-sucedido para: ${email}`);
    return data;
  },

  async signUp(email: string, password: string, fullName: string) {
    console.log(`[AUTH] Tentativa de registro para: ${email}`);
    
    const redirectUrl = `https://laelvistech.netlify.app/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      console.log(`[AUTH] Erro no registro para ${email}: ${error.message}`);
      throw new Error(error.message);
    }

    console.log(`[AUTH] Registro bem-sucedido para: ${email}`);
    return data;
  },

  async signOut() {
    console.log('[AUTH] Usuário fazendo logout');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(`[AUTH] Erro no logout: ${error.message}`);
      throw new Error(error.message);
    }
    console.log('[AUTH] Logout bem-sucedido');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get profile and role
    const [profileResult, roleResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id).limit(1)
    ]);

    const profile = profileResult.data;
    const role = roleResult.data?.[0]?.role;

    if (!profile) return null;

    // Verificar se o usuário está ativo
    if (profile.status !== 'active') {
      console.log(`[AUTH] Usuário com status inativo detectado: ${user.email}`);
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      full_name: profile.full_name,
      position: profile.position,
      department: profile.department,
      role: role,
    };
  },

  async resetPassword(email: string) {
    console.log(`[AUTH] Solicitação de reset de senha para: ${email}`);
    
    // Verificar se o email existe no sistema
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (!profileData) {
      console.log(`[AUTH] Reset negado - email não encontrado: ${email}`);
      throw new Error('Email não encontrado no sistema.');
    }

    const redirectUrl = `https://laelvistech.netlify.app/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.log(`[AUTH] Erro no reset de senha para ${email}: ${error.message}`);
      throw new Error(error.message);
    }

    console.log(`[AUTH] Email de reset enviado para: ${email}`);
  },
};
