
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

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
    setIsRunning(false);
    
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
  }, [generateRecommendations, generateRisks, toast]);

  const saveScenario = useCallback((scenario: Omit<SimulationScenario, 'id' | 'createdAt'>) => {
    const newScenario = {
      ...scenario,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setScenarios(prev => [newScenario, ...prev]);
    toast({
      title: "Cenário salvo",
      description: `"${newScenario.name}" foi salvo com sucesso.`,
    });
    
    return newScenario;
  }, [toast]);

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
