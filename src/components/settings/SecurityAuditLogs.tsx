import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Download, AlertTriangle, Shield, User } from 'lucide-react';

interface SecurityLog {
  id: string;
  user_id: string;
  action_type: string;
  ip_address: unknown;
  user_agent: string;
  session_id: string;
  metadata: any;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

const SecurityAuditLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }

      if (searchTerm) {
        query = query.or(`action_type.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as SecurityLog[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Usuário', 'Ação', 'IP', 'Nível de Risco', 'Detalhes'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.user_id || 'Sistema',
        log.action_type,
        log.ip_address || '-',
        log.risk_level,
        JSON.stringify(log.metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('login')) return <User className="h-4 w-4" />;
    if (actionType.includes('security')) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, riskFilter]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Logs de Auditoria de Segurança
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Monitore atividades de segurança e eventos suspeitos
        </p>
      </div>

      {/* Filtros e Controles */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Search className="h-4 w-4 text-neutral-500" />
            Filtros e Controles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por ação ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'low', 'medium', 'high', 'critical'].map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant={riskFilter === level ? 'default' : 'outline'}
                  onClick={() => setRiskFilter(level)}
                  className="capitalize"
                >
                  {level === 'all' ? 'Todos' : level}
                </Button>
              ))}
            </div>

            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-500" />
            Eventos de Segurança ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              Nenhum log de segurança encontrado
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {log.action_type}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                        {log.ip_address && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            IP: {String(log.ip_address)}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={getRiskBadgeColor(log.risk_level)}>
                        {log.risk_level}
                      </Badge>
                    </div>
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200">
                          Ver detalhes
                        </summary>
                        <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAuditLogs;