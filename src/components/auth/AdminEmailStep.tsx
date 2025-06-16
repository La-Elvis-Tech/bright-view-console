
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, Send } from 'lucide-react';
import { useOTP } from '@/hooks/useOTP';

interface AdminEmailStepProps {
  onAdminEmailConfirmed: (adminEmail: string) => void;
  loading?: boolean;
}

export const AdminEmailStep: React.FC<AdminEmailStepProps> = ({ 
  onAdminEmailConfirmed, 
  loading = false 
}) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const { generateOTP, loading: otpLoading } = useOTP();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setAdminEmail(email);
    setIsValidEmail(validateEmail(email));
  };

  const handleSendCode = async () => {
    if (!isValidEmail) return;

    try {
      // Gerar código OTP para o admin
      await generateOTP(adminEmail, 'signup');
      onAdminEmailConfirmed(adminEmail);
    } catch (error) {
      console.error('Erro ao enviar código para admin:', error);
    }
  };

  const isLoading = loading || otpLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Mail className="h-6 w-6 text-lab-blue" />
          Email do Administrador
        </CardTitle>
        <CardDescription>
          Digite o email do administrador que receberá o código de verificação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email do Administrador</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@empresa.com"
              value={adminEmail}
              onChange={handleEmailChange}
              className={`pl-10 ${isValidEmail && adminEmail ? 'border-green-500' : ''}`}
              disabled={isLoading}
            />
          </div>
          {adminEmail && !isValidEmail && (
            <p className="text-sm text-red-600">Por favor, digite um email válido</p>
          )}
        </div>

        <Button
          onClick={handleSendCode}
          className="w-full bg-lab-blue hover:bg-lab-blue/90"
          disabled={!isValidEmail || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando código...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Código para Admin
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            O administrador receberá um código de verificação por email que será necessário para liberar o cadastro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
