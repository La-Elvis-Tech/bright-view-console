
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { useAuthHandlers } from '@/components/auth/useAuthHandlers';
import { authLogger } from '@/utils/authLogger';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const { isAuthenticated, profile } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const {
    loading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    handleResetPassword
  } = useAuthHandlers();

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

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(loginEmail, loginPassword);
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleRegister(registerEmail, registerPassword, confirmPassword, registerName);
    
    if (result?.success) {
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setActiveTab('login');
    }
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleResetPassword(resetEmail);
    
    if (result?.success) {
      setShowResetForm(false);
      setResetEmail('');
    }
  };

  if (showResetForm) {
    return (
      <ResetPasswordForm
        email={resetEmail}
        loading={loading}
        error={authError}
        onEmailChange={setResetEmail}
        onSubmit={onResetSubmit}
        onBackToLogin={() => {
          setShowResetForm(false);
          setAuthError('');
          authLogger.info('User returned to login from password reset');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-14 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-neutral-500 dark:via-neutral-700 dark:to-neutral-950 p-4">
      <div className="w-full max-w-md">
        <AuthHeader />
        
        <AuthTabs
          activeTab={activeTab}
          onTabChange={(value) => {
            setActiveTab(value);
            setAuthError('');
            authLogger.info('Auth tab changed', { newTab: value });
          }}
          authError={authError}
          loading={loading}
          loginEmail={loginEmail}
          loginPassword={loginPassword}
          onLoginEmailChange={setLoginEmail}
          onLoginPasswordChange={setLoginPassword}
          onLoginSubmit={onLoginSubmit}
          onForgotPassword={() => {
            setShowResetForm(true);
            setAuthError('');
            authLogger.info('User clicked forgot password');
          }}
          registerName={registerName}
          registerEmail={registerEmail}
          registerPassword={registerPassword}
          confirmPassword={confirmPassword}
          onRegisterNameChange={setRegisterName}
          onRegisterEmailChange={setRegisterEmail}
          onRegisterPasswordChange={setRegisterPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onRegisterSubmit={onRegisterSubmit}
        />
      </div>
    </div>
  );
};

export default Auth;
