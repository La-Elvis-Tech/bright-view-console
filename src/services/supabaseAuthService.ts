
import { supabase } from '@/integrations/supabase/client';
import { authLogger } from '@/utils/authLogger';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  position?: string;
  department?: string;
  role?: 'admin' | 'user' | 'supervisor';
}

type UserStatus = 'active' | 'pending' | 'inactive' | 'suspended';

export const supabaseAuthService = {
  async signIn(email: string, password: string) {
    authLogger.info('Sign in attempt initiated', { email });
    
    try {
      // Primeiro tentar fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authLogger.error('Supabase auth error', { email, error: error.message });
        
        // Mapear erros comuns para mensagens mais amigáveis
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        }
        if (error.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.');
        }
        
        throw new Error(error.message || 'Erro no login. Tente novamente.');
      }

      // Verificar status do usuário APÓS o login bem-sucedido
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('status, full_name')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          authLogger.error('Error checking user profile after login', { email, error: profileError.message });
          throw new Error('Erro ao verificar dados do usuário.');
        }

        if (!profileData) {
          authLogger.warning('User profile not found after login', { email });
          throw new Error('Perfil do usuário não encontrado no sistema.');
        }

        const userStatus = profileData.status as UserStatus;

        if (userStatus === 'pending') {
          authLogger.warning('Login allowed but account pending', { email });
          // Permitir login mas o ProtectedRoute irá lidar com o status pending
        } else if (userStatus === 'inactive') {
          authLogger.warning('Login denied - account inactive', { email });
          await supabase.auth.signOut(); // Fazer logout
          throw new Error('Sua conta foi desativada. Entre em contato com um administrador.');
        } else if (userStatus === 'suspended') {
          authLogger.warning('Login denied - account suspended', { email });
          await supabase.auth.signOut(); // Fazer logout
          throw new Error('Sua conta foi suspensa. Entre em contato com um administrador.');
        }
      }

      authLogger.info('Sign in successful', { email, userId: data.user?.id });
      return data;
    } catch (error: any) {
      authLogger.error('Sign in failed', { email, error: error.message });
      throw error;
    }
  },

  async signUp(email: string, password: string, fullName: string) {
    authLogger.info('Sign up attempt initiated', { email, fullName });
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
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
        authLogger.error('Supabase signup error', { email, error: error.message });
        
        // Mapear erros comuns
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.');
        }
        if (error.message.includes('Password should be at least')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        if (error.message.includes('Unable to validate email address')) {
          throw new Error('Formato de email inválido.');
        }
        
        throw new Error(error.message || 'Erro no cadastro. Tente novamente.');
      }

      authLogger.info('Sign up successful', { email, userId: data.user?.id });
      return data;
    } catch (error: any) {
      authLogger.error('Sign up failed', { email, error: error.message });
      throw error;
    }
  },

  async signOut() {
    authLogger.info('Sign out initiated');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        authLogger.error('Supabase signout error', { error: error.message });
        throw new Error(error.message || 'Erro no logout.');
      }
      
      authLogger.info('Sign out successful');
    } catch (error: any) {
      authLogger.error('Sign out failed', { error: error.message });
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        authLogger.error('Error getting current user', { error: error.message });
        return null;
      }
      
      if (!user) {
        return null;
      }

      // Get profile and role
      const [profileResult, roleResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).limit(1).maybeSingle()
      ]);

      const profile = profileResult.data;
      const role = roleResult.data?.role;

      if (!profile) {
        authLogger.warning('User profile not found', { userId: user.id });
        return null;
      }

      const userStatus = profile.status as UserStatus;

      // Verificar se o usuário está ativo (permitir pending para mostrar tela apropriada)
      if (userStatus === 'inactive' || userStatus === 'suspended') {
        authLogger.warning('User with inactive/suspended status detected', { 
          userId: user.id, 
          email: user.email, 
          status: userStatus 
        });
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
    } catch (error: any) {
      authLogger.error('Error in getCurrentUser', { error: error.message });
      return null;
    }
  },

  async resetPassword(email: string) {
    authLogger.info('Password reset requested', { email });
    
    try {
      // Verificar se o email existe no sistema
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        authLogger.error('Error checking email for reset', { email, error: profileError.message });
        throw new Error('Erro ao verificar email.');
      }

      if (!profileData) {
        authLogger.warning('Password reset denied - email not found', { email });
        throw new Error('Email não encontrado no sistema.');
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        authLogger.error('Supabase password reset error', { email, error: error.message });
        throw new Error(error.message || 'Erro ao enviar email de recuperação.');
      }

      authLogger.info('Password reset email sent', { email });
    } catch (error: any) {
      authLogger.error('Password reset failed', { email, error: error.message });
      throw error;
    }
  },
};
