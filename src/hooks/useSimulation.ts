
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface SimulationScenario {
  id: string;
  name: string;
  demandChange: number;
  leadTimeVariability: number;
  safetyStock: number;
  budgetLimit: number;
  serviceLevel: number;
  seasonalityFactor: number;
  riskTolerance: number;
  createdAt: Date;
}

interface SimulationResult {
  id: string;
  scenarioId: string;
  stockoutProbability: number;
  averageStockLevel: number;
  totalCost: number;
  serviceLevel: number;
  recommendations: string[];
  risks: string[];
  runAt: Date;
}

export const useSimulation = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = useCallback((stockoutProb: number, avgStock: number, scenario: SimulationScenario): string[] => {
    const recommendations = [];
    
    if (stockoutProb > 10) {
      recommendations.push("Aumentar safety stock em 20% para reduzir risco de ruptura");
    }
    if (scenario.leadTimeVariability > 30) {
      recommendations.push("Diversificar fornecedores para reduzir variabilidade de entrega");
    }
    if (avgStock > 1000) {
      recommendations.push("Otimizar tamanho de lotes para reduzir custo de estoque");
    }
    if (scenario.serviceLevel < 95) {
      recommendations.push("Aumentar nível de serviço target para 95% ou superior");
    }
    
    return recommendations;
  }, []);

  const generateRisks = useCallback((stockoutProb: number, scenario: SimulationScenario): string[] => {
    const risks = [];
    
    if (stockoutProb > 15) {
      risks.push("Alto risco de ruptura de estoque");
    }
    if (scenario.budgetLimit < 45000) {
      risks.push("Orçamento limitado pode restringir reposições");
    }
    if (scenario.leadTimeVariability > 35) {
      risks.push("Alta variabilidade de lead time aumenta incerteza");
    }
    
    return risks;
  }, []);

  const runSimulation = useCallback(async (currentScenario: SimulationScenario) => {
    setIsRunning(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calcular resultados baseados nos parâmetros
      const stockoutProb = Math.max(0, 
        15 - (currentScenario.safetyStock * 1.5) + 
        (currentScenario.demandChange * 0.3) + 
        (currentScenario.leadTimeVariability * 0.2)
      );
      
      const avgStock = currentScenario.safetyStock * 30 * (1 + currentScenario.demandChange / 100);
      const totalCost = avgStock * 15 + (stockoutProb * 1000);
      
      const newResult: SimulationResult = {
        id: Date.now().toString(),
        scenarioId: currentScenario.id || Date.now().toString(),
        stockoutProbability: Math.round(stockoutProb * 100) / 100,
        averageStockLevel: Math.round(avgStock),
        totalCost: Math.round(totalCost),
        serviceLevel: Math.max(85, currentScenario.serviceLevel - stockoutProb),
        recommendations: generateRecommendations(stockoutProb, avgStock, currentScenario),
        risks: generateRisks(stockoutProb, currentScenario),
        runAt: new Date()
      };
      
      setResults(prev => [newResult, ...prev]);
      
      // Verificar se resultado é crítico e notificar
      if (newResult.stockoutProbability > 15) {
        toast({
          title: "⚠️ Resultado Crítico",
          description: `Probabilidade de ruptura elevada: ${newResult.stockoutProbability}%`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Simulação concluída",
          description: `Probabilidade de ruptura: ${newResult.stockoutProbability}%`,
        });
      }
      
      return newResult;
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: "Erro na simulação",
        description: "Ocorreu um erro ao executar a simulação.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [generateRecommendations, generateRisks, toast]);

  const saveScenario = useCallback(async (scenario: Omit<SimulationScenario, 'id' | 'createdAt'>) => {
    try {
      const newScenario = {
        ...scenario,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      
      // Salvar no estado local
      setScenarios(prev => [newScenario, ...prev]);
      
      // Opcionalmente salvar no Supabase (implementar tabela de cenários se necessário)
      try {
        await supabase
          .from('system_settings')
          .upsert({
            key: `simulation_scenario_${newScenario.id}`,
            category: 'simulation',
            value: newScenario,
            description: `Cenário de simulação: ${newScenario.name}`
          });
      } catch (error) {
        console.warn('Could not save scenario to database:', error);
      }
      
      toast({
        title: "Cenário salvo",
        description: `"${newScenario.name}" foi salvo com sucesso.`,
      });
      
      return newScenario;
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cenário.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Carregar cenários salvos na inicialização
  useEffect(() => {
    const loadSavedScenarios = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('category', 'simulation')
          .like('key', 'simulation_scenario_%');

        if (!error && data) {
          const savedScenarios = data.map(item => item.value as SimulationScenario);
          setScenarios(savedScenarios);
        }
      } catch (error) {
        console.warn('Could not load saved scenarios:', error);
      }
    };

    loadSavedScenarios();
  }, []);

  return {
    scenarios,
    results,
    isRunning,
    runSimulation,
    saveScenario,
    setScenarios,
    setResults
  };
};
