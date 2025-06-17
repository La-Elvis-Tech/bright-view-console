
import { authLogger } from './authLogger';

export const getAuthErrorMessage = (error: any): string => {
  const errorMessage = error?.message || error || 'Erro desconhecido';
  authLogger.error('Auth error occurred', { originalError: errorMessage });

  // Map common Supabase auth errors to user-friendly Portuguese messages
  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos. Verifique suas credenciais.',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está cadastrado. Tente fazer login.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Formato de email inválido.',
    'User not found': 'Usuário não encontrado no sistema.',
    'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'Token has expired or is invalid': 'Sessão expirada. Faça login novamente.',
    'Network error': 'Erro de conexão. Verifique sua internet.',
    'pending': 'Sua conta está aguardando aprovação de um administrador.',
    'inactive': 'Sua conta foi desativada. Entre em contato com um administrador.',
    'suspended': 'Sua conta foi suspensa. Entre em contato com um administrador.'
  };

  // Check for status-related errors first
  if (errorMessage.includes('pending')) {
    return errorMappings['pending'];
  }
  if (errorMessage.includes('inactive') || errorMessage.includes('desativada')) {
    return errorMappings['inactive'];
  }
  if (errorMessage.includes('suspended') || errorMessage.includes('suspensa')) {
    return errorMappings['suspended'];
  }

  // Check exact matches
  if (errorMappings[errorMessage]) {
    return errorMappings[errorMessage];
  }

  // Check partial matches
  for (const [key, value] of Object.entries(errorMappings)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return `Erro de autenticação: ${errorMessage}`;
};

export const cleanupAuthState = () => {
  authLogger.info('Cleaning up auth state');
  
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
        authLogger.debug('Removed auth key', { key });
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
          authLogger.debug('Removed session auth key', { key });
        }
      });
    }

    authLogger.info('Auth state cleanup completed');
  } catch (error) {
    authLogger.error('Error during auth cleanup', { error });
  }
};
