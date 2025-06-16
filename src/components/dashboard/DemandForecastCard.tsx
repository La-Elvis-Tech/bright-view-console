
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Calendar, Package, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmailAlerts } from '@/hooks/useEmailAlerts';

interface ForecastData {
  item_name: string;
  current_stock: number;
  predicted_shortage_date: string;
  predicted_demand: number;
  confidence_level: number;
  unit_measure: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const DemandForecastCard = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const { sendForecastAlert } = useEmailAlerts();

  // Simular dados de previsão (em produção, viria do Supabase)
  const generateMockForecast = (): ForecastData[] => {
    const items = [
      { name: 'Seringa 5ml', stock: 45, category: 'Descartáveis' },
      { name: 'Tubo EDTA', stock: 120, category: 'Coleta' },
      { name: 'Álcool 70%', stock: 8, category: 'Antissépticos' },
      { name: 'Luvas Nitrilo M', stock: 200, category: 'EPI' },
      { name: 'Reagente Glicose', stock: 25, category: 'Reagentes' }
    ];

    return items.map(item => {
      const demandRate = Math.random() * 50 + 10; // 10-60 unidades por dia
      const daysUntilShortage = Math.floor(item.stock / demandRate);
      const shortageDate = new Date();
      shortageDate.setDate(shortageDate.getDate() + daysUntilShortage);

      return {
        item_name: item.name,
        current_stock: item.stock,
        predicted_shortage_date: shortageDate.toISOString().split('T')[0],
        predicted_demand: Math.round(demandRate),
        confidence_level: Math.random() * 30 + 70, // 70-100%
        unit_measure: 'un',
        category: item.category,
        priority: daysUntilShortage <= 3 ? 'high' : daysUntilShortage <= 7 ? 'medium' : 'low'
      };
    });
  };

  const runForecastAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Simular processamento de análise
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const forecast = generateMockForecast();
      setForecastData(forecast);

      // Enviar alertas para itens com alta prioridade
      const highPriorityItems = forecast.filter(item => item.priority === 'high');
      for (const item of highPriorityItems) {
        await sendForecastAlert({
          item: item.item_name,
          predicted_date: item.predicted_shortage_date,
          unit_id: 'current_unit'
        });
      }

      toast({
        title: 'Análise concluída',
        description: `Previsão gerada para ${forecast.length} itens. ${highPriorityItems.length} alertas enviados.`,
      });
    } catch (error) {
      console.error('Erro na análise de previsão:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível gerar a previsão de demanda.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDaysUntilShortage = (date: string) => {
    const today = new Date();
    const shortageDate = new Date(date);
    const diffTime = shortageDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    // Carregar dados salvos se existirem
    const savedForecast = localStorage.getItem('forecast_data');
    if (savedForecast) {
      try {
        setForecastData(JSON.parse(savedForecast));
      } catch (error) {
        console.error('Erro ao carregar dados de previsão:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Salvar dados quando atualizados
    if (forecastData.length > 0) {
      localStorage.setItem('forecast_data', JSON.stringify(forecastData));
    }
  }, [forecastData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Análise de Demanda e Forecast (ADF)
            </CardTitle>
            <CardDescription>
              Previsão inteligente de demanda e alertas de reposição
            </CardDescription>
          </div>
          <Button 
            onClick={runForecastAnalysis} 
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar ADF
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {forecastData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma análise de demanda disponível</p>
            <p className="text-sm">Execute a ADF para gerar previsões</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {forecastData.filter(item => item.priority === 'high').length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Alertas Críticos</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {forecastData.filter(item => item.priority === 'medium').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Atenção</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(forecastData.reduce((acc, item) => acc + item.confidence_level, 0) / forecastData.length)}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Confiança Média</div>
              </div>
            </div>

            <div className="space-y-3">
              {forecastData.map((item, index) => {
                const daysUntilShortage = getDaysUntilShortage(item.predicted_shortage_date);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Crítico' : 
                           item.priority === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {item.current_stock} {item.unit_measure}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {daysUntilShortage > 0 ? `${daysUntilShortage} dias` : 'Estoque crítico'}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {item.predicted_demand}/dia
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(item.confidence_level)}% confiança
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.predicted_shortage_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DemandForecastCard;
