
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, AlertTriangle } from "lucide-react";

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

interface SimulationResultsProps {
  results: SimulationResult[];
}

const SimulationResults: React.FC<SimulationResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            Nenhuma simulação executada ainda
          </p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
            Execute uma simulação na aba Parâmetros para ver os resultados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <Card key={result.id} className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-neutral-900 dark:text-neutral-100">
                  Resultado da Simulação #{results.length - index}
                </CardTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Executado em {result.runAt.toLocaleString()}
                </p>
              </div>
              <Badge 
                variant={result.stockoutProbability > 10 ? "destructive" : "default"}
                className="px-3 py-1"
              >
                {result.stockoutProbability > 10 ? "Alto Risco" : "Baixo Risco"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {result.stockoutProbability}%
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Prob. Ruptura</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {result.averageStockLevel}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Estoque Médio</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  R$ {result.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Custo Total</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {result.serviceLevel.toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Nível Serviço</div>
              </div>
            </div>

            {result.recommendations.length > 0 && (
              <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <Target className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  Recomendações
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.risks.length > 0 && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <AlertTriangle className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  Riscos Identificados
                </h4>
                <ul className="space-y-2">
                  {result.risks.map((risk, i) => (
                    <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SimulationResults;
