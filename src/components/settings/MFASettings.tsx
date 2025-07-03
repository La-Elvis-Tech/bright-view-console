import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMFA } from '@/hooks/useMFA';
import { Shield, Key, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MFASettings = () => {
  const { mfaSettings, loading, qrCodeUrl, enableMFA, disableMFA, verifyTOTP } = useMFA();
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const { toast } = useToast();

  const handleEnableMFA = async () => {
    try {
      const result = await enableMFA(recoveryEmail);
      setBackupCodes(result.backupCodes);
      setShowSetup(true);
    } catch (error) {
      console.error('Erro ao ativar MFA:', error);
    }
  };

  const handleVerifySetup = async () => {
    const isValid = await verifyTOTP(verificationCode);
    if (isValid) {
      setShowSetup(false);
      setVerificationCode('');
      toast({
        title: 'MFA Configurado',
        description: 'Autenticação de dois fatores foi ativada com sucesso.',
      });
    } else {
      toast({
        title: 'Código Inválido',
        description: 'O código de verificação está incorreto.',
        variant: 'destructive',
      });
    }
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado',
      description: 'Código de backup copiado para a área de transferência.',
    });
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/3"></div>
          <div className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Autenticação Multifator (MFA)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      {/* Status atual do MFA */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="h-4 w-4 text-neutral-500" />
            Status do MFA
            {mfaSettings.mfa_enabled ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            {mfaSettings.mfa_enabled 
              ? 'Sua conta está protegida com autenticação de dois fatores'
              : 'Configure a autenticação de dois fatores para maior segurança'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaSettings.mfa_enabled ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Recomendamos fortemente ativar o MFA para proteger sua conta contra acessos não autorizados.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email de Recuperação (Opcional)
                </Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                />
              </div>

              <Button 
                onClick={handleEnableMFA}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Ativar MFA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  MFA está ativo. Última utilização: {mfaSettings.last_used_at ? 
                    new Date(mfaSettings.last_used_at).toLocaleDateString('pt-BR') : 
                    'Nunca usado'
                  }
                </AlertDescription>
              </Alert>

              <Button 
                onClick={disableMFA}
                variant="destructive"
              >
                Desativar MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup do MFA */}
      {showSetup && (
        <Card className="border-0 shadow-sm bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Configurar Aplicativo Autenticador
            </CardTitle>
            <CardDescription className="text-sm text-blue-600 dark:text-blue-400">
              Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code (simulado) */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-sm text-neutral-600">
                  <p>QR Code</p>
                  <p className="text-xs mt-2">Use o aplicativo autenticador</p>
                  <p className="text-xs font-mono bg-neutral-100 p-2 mt-2 rounded text-[10px] break-all">
                    {qrCodeUrl.substring(0, 50)}...
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Código de Verificação
              </Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="border-0 bg-white dark:bg-blue-900/40 shadow-sm text-center text-lg font-mono"
              />
            </div>

            <Button 
              onClick={handleVerifySetup}
              disabled={verificationCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Verificar e Ativar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Códigos de Backup */}
      {backupCodes.length > 0 && (
        <Card className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Códigos de Backup
            </CardTitle>
            <CardDescription className="text-sm text-amber-600 dark:text-amber-400">
              Guarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-white dark:bg-amber-900/20 rounded border"
                >
                  <span className="font-mono text-sm">{code}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyBackupCode(code)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={downloadBackupCodes}
              variant="outline"
              className="w-full"
            >
              Baixar Códigos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MFASettings;