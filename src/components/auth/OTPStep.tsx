
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { useOTP } from '@/hooks/useOTP';

interface OTPStepProps {
  email: string;
  type?: 'login' | 'signup' | 'password_reset';
  onVerified: () => void;
  onResend?: () => void;
  loading?: boolean;
}

export const OTPStep: React.FC<OTPStepProps> = ({ 
  email, 
  type = 'signup', 
  onVerified, 
  onResend,
  loading = false 
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, generateOTP, loading: otpLoading } = useOTP();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;

    const isValid = await verifyOTP(email, otpCode, type);
    if (isValid) {
      onVerified();
    }
  };

  const handleResend = async () => {
    await generateOTP(email, type);
    setCountdown(60);
    setCanResend(false);
    setOtpCode('');
    onResend?.();
  };

  const isLoading = loading || otpLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Mail className="h-6 w-6 text-lab-blue" />
          Verificação OTP
        </CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos enviado para {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp">Código de Verificação</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleVerify}
          className="w-full bg-lab-blue hover:bg-lab-blue/90"
          disabled={otpCode.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Código'
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Não recebeu o código?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={!canResend || isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {canResend ? 'Reenviar código' : `Reenviar em ${countdown}s`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
