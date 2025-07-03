import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCompliance } from '@/hooks/useCompliance';
import { Shield, Lock, FileText, Globe } from 'lucide-react';

const ComplianceSettings = () => {
  const { settings, loading, updateSetting } = useCompliance();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Configurações de Compliance
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Gerencie configurações de compliance HIPAA/LGPD e segurança
        </p>
      </div>

      {/* HIPAA Compliance */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            HIPAA Compliance
            <Badge variant="secondary" className="ml-2">Crítico</Badge>
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configurações para conformidade com HIPAA (Health Insurance Portability and Accountability Act)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  HIPAA Habilitado
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ativar conformidade HIPAA
                </p>
              </div>
              <Switch
                checked={settings.hipaa_compliance?.enabled || false}
                onCheckedChange={(checked) => 
                  updateSetting('hipaa_compliance', {
                    ...settings.hipaa_compliance,
                    enabled: checked
                  })
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Criptografia em Repouso
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Dados criptografados no banco
                </p>
              </div>
              <Switch
                checked={settings.hipaa_compliance?.encryption_at_rest || false}
                onCheckedChange={(checked) => 
                  updateSetting('hipaa_compliance', {
                    ...settings.hipaa_compliance,
                    encryption_at_rest: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Criptografia em Trânsito
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  SSL/TLS obrigatório
                </p>
              </div>
              <Switch
                checked={settings.hipaa_compliance?.encryption_in_transit || false}
                onCheckedChange={(checked) => 
                  updateSetting('hipaa_compliance', {
                    ...settings.hipaa_compliance,
                    encryption_in_transit: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Log de Acesso
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Auditoria completa de acessos
                </p>
              </div>
              <Switch
                checked={settings.hipaa_compliance?.access_logging || false}
                onCheckedChange={(checked) => 
                  updateSetting('hipaa_compliance', {
                    ...settings.hipaa_compliance,
                    access_logging: checked
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LGPD Compliance */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-500" />
            LGPD Compliance
            <Badge variant="secondary" className="ml-2">Crítico</Badge>
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configurações para conformidade com LGPD (Lei Geral de Proteção de Dados)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  LGPD Habilitado
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ativar conformidade LGPD
                </p>
              </div>
              <Switch
                checked={settings.lgpd_compliance?.enabled || false}
                onCheckedChange={(checked) => 
                  updateSetting('lgpd_compliance', {
                    ...settings.lgpd_compliance,
                    enabled: checked
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Retenção de Dados (dias)
              </Label>
              <Input
                type="number"
                min="90"
                max="3650"
                value={settings.lgpd_compliance?.data_retention_days || 1095}
                onChange={(e) => 
                  updateSetting('lgpd_compliance', {
                    ...settings.lgpd_compliance,
                    data_retention_days: parseInt(e.target.value) || 1095
                  })
                }
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Gestão de Consentimento
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Controle de consentimentos
                </p>
              </div>
              <Switch
                checked={settings.lgpd_compliance?.consent_management || false}
                onCheckedChange={(checked) => 
                  updateSetting('lgpd_compliance', {
                    ...settings.lgpd_compliance,
                    consent_management: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Direito ao Esquecimento
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Permitir exclusão de dados
                </p>
              </div>
              <Switch
                checked={settings.lgpd_compliance?.right_to_deletion || false}
                onCheckedChange={(checked) => 
                  updateSetting('lgpd_compliance', {
                    ...settings.lgpd_compliance,
                    right_to_deletion: checked
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Política de Senhas */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-500" />
            Política de Senhas
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configurações de segurança para senhas de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Comprimento Mínimo
              </Label>
              <Input
                type="number"
                min="8"
                max="32"
                value={settings.password_policy?.min_length || 12}
                onChange={(e) => 
                  updateSetting('password_policy', {
                    ...settings.password_policy,
                    min_length: parseInt(e.target.value) || 12
                  })
                }
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Expiração (dias)
              </Label>
              <Input
                type="number"
                min="30"
                max="365"
                value={settings.password_policy?.expire_days || 90}
                onChange={(e) => 
                  updateSetting('password_policy', {
                    ...settings.password_policy,
                    expire_days: parseInt(e.target.value) || 90
                  })
                }
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Caracteres Especiais
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Exigir símbolos especiais
                </p>
              </div>
              <Switch
                checked={settings.password_policy?.require_special || false}
                onCheckedChange={(checked) => 
                  updateSetting('password_policy', {
                    ...settings.password_policy,
                    require_special: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Letras Maiúsculas
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Exigir letras maiúsculas
                </p>
              </div>
              <Switch
                checked={settings.password_policy?.require_uppercase || false}
                onCheckedChange={(checked) => 
                  updateSetting('password_policy', {
                    ...settings.password_policy,
                    require_uppercase: checked
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auditoria */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            Configurações de Auditoria
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configurações para logs e auditoria de sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Retenção de Logs (dias)
              </Label>
              <Input
                type="number"
                min="30"
                max="2555"
                value={settings.audit_settings?.retain_days || 365}
                onChange={(e) => 
                  updateSetting('audit_settings', {
                    ...settings.audit_settings,
                    retain_days: parseInt(e.target.value) || 365
                  })
                }
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Alertas em Tempo Real
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Notificações imediatas
                </p>
              </div>
              <Switch
                checked={settings.audit_settings?.real_time_alerts || false}
                onCheckedChange={(checked) => 
                  updateSetting('audit_settings', {
                    ...settings.audit_settings,
                    real_time_alerts: checked
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceSettings;