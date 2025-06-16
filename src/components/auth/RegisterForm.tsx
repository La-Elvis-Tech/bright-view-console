
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Mail, Lock } from 'lucide-react';

interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  email,
  password,
  confirmPassword,
  loading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-neutral-700 dark:text-neutral-300 font-medium">
          Nome Completo
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Seu nome completo"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-12 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-neutral-800/70"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-neutral-700 dark:text-neutral-300 font-medium">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            id="register-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10 h-12 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-neutral-800/70"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-neutral-700 dark:text-neutral-300 font-medium">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="pl-10 h-12 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-neutral-800/70"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-neutral-700 dark:text-neutral-300 font-medium">
          Confirmar Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="pl-10 h-12 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-neutral-800/70"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar Conta
          </>
        )}
      </Button>
    </form>
  );
};
