
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { AuthErrorAlert } from '@/components/auth/AuthErrorAlert';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LogIn, UserPlus } from 'lucide-react';
import { authLogger } from '@/utils/authLogger';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');

  const { signIn, signUp, isAuthenticated, profile } = useAuthContext();
  const { resetPassword } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    authLogger.info('Auth page loaded', { 
      isAuthenticated, 
      profileStatus: profile?.status, 
      fromPath: from 
    });

    if (isAuthenticated && profile?.status === 'active') {
      authLogger.info('User already authenticated and active, redirecting', { 
        fromPath: from 
      });
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, profile?.status, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Login form submitted', { email: loginEmail });
      
      const { data, error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        setAuthError(error.message || 'Erro no login. Verifique suas credenciais.');
        return;
      }

      if (data?.user) {
        authLogger.info('Login successful, redirecting', { 
          email: loginEmail, 
          fromPath: from 
        });
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      authLogger.error('Login form error', { email: loginEmail, error: error.message });
      setAuthError(error.message || 'Erro no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (registerPassword !== confirmPassword) {
      setAuthError('As senhas não coincidem.');
      authLogger.warning('Registration failed - password mismatch', { email: registerEmail });
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres.');
      authLogger.warning('Registration failed - password too short', { email: registerEmail });
      return;
    }

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Registration form submitted', { 
        email: registerEmail, 
        name: registerName 
      });
      
      const { data, error } = await signUp(registerEmail, registerPassword, registerName);
      
      if (error) {
        setAuthError(error.message || 'Erro no cadastro. Tente novamente.');
        return;
      }

      if (data) {
        authLogger.info('Registration successful', { email: registerEmail });
        
        // Reset form
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        setActiveTab('login');
      }
    } catch (error: any) {
      authLogger.error('Registration form error', { 
        email: registerEmail, 
        error: error.message 
      });
      setAuthError(error.message || 'Erro no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setAuthError('');
      
      authLogger.info('Password reset form submitted', { email: resetEmail });
      
      await resetPassword(resetEmail);
      
      setShowResetForm(false);
      setResetEmail('');
    } catch (error: any) {
      authLogger.error('Password reset form error', { 
        email: resetEmail, 
        error: error.message 
      });
      setAuthError(error.message || 'Não foi possível enviar o email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <ResetPasswordForm
        email={resetEmail}
        loading={loading}
        error={authError}
        onEmailChange={setResetEmail}
        onSubmit={handleResetPassword}
        onBackToLogin={() => {
          setShowResetForm(false);
          setAuthError('');
          authLogger.info('User returned to login from password reset');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 h-32">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-2">
            <img 
              src="/logolaelvis.svg" 
              alt="La Elvis Tech" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            La Elvis Tech
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">Gestão laboratorial inteligente</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setAuthError('');
          authLogger.info('Auth tab changed', { newTab: value });
        }}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-neutral-100/80 dark:bg-neutral-800/80 p-1 rounded-lg backdrop-blur-sm">
            <TabsTrigger 
              value="login" 
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm font-medium"
            >
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Cadastro
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[500px]">
            <TabsContent value="login">
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-neutral-900/90 border-0 shadow-2xl">
                <CardContent className="pt-6">
                  {authError && (
                    <div className="mb-4">
                      <AuthErrorAlert error={authError} />
                    </div>
                  )}
                  
                  <LoginForm
                    email={loginEmail}
                    password={loginPassword}
                    loading={loading}
                    onEmailChange={setLoginEmail}
                    onPasswordChange={setLoginPassword}
                    onSubmit={handleLogin}
                    onForgotPassword={() => {
                      setShowResetForm(true);
                      setAuthError('');
                      authLogger.info('User clicked forgot password');
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-neutral-900/90 border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-neutral-900 dark:text-white">Criar Conta</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Preencha seus dados para criar sua conta. Após o cadastro, você receberá um email de confirmação e aguardará a aprovação de um administrador.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {authError && (
                    <div className="mb-4">
                      <AuthErrorAlert error={authError} />
                    </div>
                  )}
                  
                  <RegisterForm
                    name={registerName}
                    email={registerEmail}
                    password={registerPassword}
                    confirmPassword={confirmPassword}
                    loading={loading}
                    onNameChange={setRegisterName}
                    onEmailChange={setRegisterEmail}
                    onPasswordChange={setRegisterPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    onSubmit={handleRegisterSubmit}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
