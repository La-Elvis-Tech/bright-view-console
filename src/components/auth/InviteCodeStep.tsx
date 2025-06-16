
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { useInviteCodes } from '@/hooks/useInviteCodes';

interface ValidationResult {
  valid: boolean;
  role?: string;
  message?: string;
}

interface InviteCodeStepProps {
  onValidCode: (code: string, role: string) => void;
  loading?: boolean;
}

export const InviteCodeStep: React.FC<InviteCodeStepProps> = ({ onValidCode, loading = false }) => {
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { validateInviteCode, loading: validating } = useInviteCodes();

  const handleValidate = async () => {
    if (!code.trim()) return;

    try {
      const result = await validateInviteCode(code.trim().toUpperCase());
      
      // Safely convert the result to ValidationResult
      const validationResult: ValidationResult = {
        valid: Boolean(result && typeof result === 'object' && 'valid' in result ? result.valid : false),
        role: result && typeof result === 'object' && 'role' in result ? String(result.role) : undefined,
        message: result && typeof result === 'object' && 'message' in result ? String(result.message) : undefined
      };
      
      setValidationResult(validationResult);

      if (validationResult.valid && validationResult.role) {
        onValidCode(code.trim().toUpperCase(), validationResult.role);
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Erro ao validar código'
      });
    }
  };

  const isLoading = loading || validating;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Shield className="h-6 w-6 text-lab-blue" />
          Código de Convite
        </CardTitle>
        <CardDescription>
          Digite o código de convite fornecido pelo administrador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-code">Código de Convite</Label>
          <Input
            id="invite-code"
            type="text"
            placeholder="Ex: ADMIN001"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setValidationResult(null);
            }}
            className="text-center font-mono tracking-wider"
            maxLength={8}
            disabled={isLoading}
          />
        </div>

        {validationResult && (
          <div className={`p-3 rounded-lg border ${
            validationResult.valid 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 text-sm">
                    Código válido!
                  </span>
                  {validationResult.role && (
                    <Badge variant="outline" className="ml-auto">
                      {validationResult.role}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {validationResult.message || 'Código inválido'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleValidate}
          className="w-full bg-lab-blue hover:bg-lab-blue/90"
          disabled={!code.trim() || isLoading || validationResult?.valid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando...
            </>
          ) : validationResult?.valid ? (
            'Código Validado'
          ) : (
            'Validar Código'
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Não possui um código? Entre em contato com o administrador.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
