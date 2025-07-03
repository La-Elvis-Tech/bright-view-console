
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { authLogger } from '@/utils/authLogger';

export const useAuthHandlers = () => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { signIn, signUp } = useAuthContext();
  const { resetPassword } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (email: string, password: string) => {
    if (loading) return;

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Login form submitted', { email });
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setAuthError(error.message || 'Erro no login. Verifique suas credenciais.');
        return;
      }

      if (data?.user) {
        authLogger.info('Login successful, redirecting', { 
          email, 
          fromPath: from 
        });
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      authLogger.error('Login form error', { email, error: error.message });
      setAuthError(error.message || 'Erro no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    name: string
  ) => {
    if (loading) return;

    if (password !== confirmPassword) {
      setAuthError('As senhas não coincidem.');
      authLogger.warning('Registration failed - password mismatch', { email });
      return;
    }

    if (password.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres.');
      authLogger.warning('Registration failed - password too short', { email });
      return;
    }

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Registration form submitted', { 
        email, 
        name 
      });
      
      const { data, error } = await signUp(email, password, name);
      
      if (error) {
        setAuthError(error.message || 'Erro no cadastro. Tente novamente.');
        return;
      }

      if (data) {
        authLogger.info('Registration successful', { email });
        return { success: true };
      }
    } catch (error: any) {
      authLogger.error('Registration form error', { 
        email, 
        error: error.message 
      });
      setAuthError(error.message || 'Erro no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (loading) return;

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Password reset form submitted', { email });
      
      await resetPassword(email);
      
      return { success: true };
    } catch (error: any) {
      authLogger.error('Password reset form error', { 
        email, 
        error: error.message 
      });
      setAuthError(error.message || 'Não foi possível enviar o email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    handleResetPassword
  };
};
