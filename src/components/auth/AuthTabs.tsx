
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { AuthErrorAlert } from './AuthErrorAlert';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  authError: string;
  loading: boolean;
  // Login props
  loginEmail: string;
  loginPassword: string;
  onLoginEmailChange: (email: string) => void;
  onLoginPasswordChange: (password: string) => void;
  onLoginSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  // Register props
  registerName: string;
  registerEmail: string;
  registerPassword: string;
  confirmPassword: string;
  onRegisterNameChange: (name: string) => void;
  onRegisterEmailChange: (email: string) => void;
  onRegisterPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onRegisterSubmit: (e: React.FormEvent) => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  onTabChange,
  authError,
  loading,
  loginEmail,
  loginPassword,
  onLoginEmailChange,
  onLoginPasswordChange,
  onLoginSubmit,
  onForgotPassword,
  registerName,
  registerEmail,
  registerPassword,
  confirmPassword,
  onRegisterNameChange,
  onRegisterEmailChange,
  onRegisterPasswordChange,
  onConfirmPasswordChange,
  onRegisterSubmit
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
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
                onEmailChange={onLoginEmailChange}
                onPasswordChange={onLoginPasswordChange}
                onSubmit={onLoginSubmit}
                onForgotPassword={onForgotPassword}
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
                onNameChange={onRegisterNameChange}
                onEmailChange={onRegisterEmailChange}
                onPasswordChange={onRegisterPasswordChange}
                onConfirmPasswordChange={onConfirmPasswordChange}
                onSubmit={onRegisterSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};
