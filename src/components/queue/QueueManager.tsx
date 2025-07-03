
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Zap } from 'lucide-react';
import { useSystemLoad } from '@/hooks/useSystemLoad';
import { SnakeGame } from './SnakeGame';

interface QueueManagerProps {
  isVisible: boolean;
  onOperationReady?: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({ 
  isVisible, 
  onOperationReady 
}) => {
  const { metrics, queuePosition, isOverloaded } = useSystemLoad();
  const [showGame, setShowGame] = useState(false);
  const [operationReady, setOperationReady] = useState(false);

  useEffect(() => {
    // Verifica se a operação está pronta (não há mais fila ou carga baixa)
    if (isOverloaded && queuePosition <= 1 && metrics.currentLoad < 0.5) {
      setOperationReady(true);
      onOperationReady?.();
    } else {
      setOperationReady(false);
    }
  }, [isOverloaded, queuePosition, metrics.currentLoad, onOperationReady]);

  if (!isVisible || !isOverloaded) {
    return null;
  }

  const estimatedWaitTime = Math.max(1, Math.ceil(
    (queuePosition * metrics.averageResponseTime) / 1000 / 60
  ));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Sistema em Alta Demanda
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Métricas do Sistema */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Carga do Sistema</span>
              <span className="font-medium">{Math.round(metrics.currentLoad * 100)}%</span>
            </div>
            <Progress value={metrics.currentLoad * 100} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400">Posição na fila</p>
                  <p className="font-semibold">{queuePosition > 0 ? queuePosition : 'Processando...'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400">Tempo estimado</p>
                  <p className="font-semibold">{estimatedWaitTime} min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão da Operação Pronta */}
          {operationReady && (
            <Button 
              onClick={onOperationReady}
              className="w-full bg-green-500 hover:bg-green-600 text-white animate-pulse"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Operação Disponível - Clique para Continuar
            </Button>
          )}

          {/* Toggle do Minigame */}
          {!operationReady && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Que tal jogar enquanto espera?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGame(!showGame)}
                >
                  {showGame ? 'Fechar Jogo' : 'Jogar Snake'}
                </Button>
              </div>
              
              {showGame && (
                <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
                  <SnakeGame />
                </div>
              )}
            </div>
          )}

          {/* Informações */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            O sistema está processando muitas operações simultaneamente. 
            Sua solicitação será processada em breve.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
