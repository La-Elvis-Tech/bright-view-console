
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
      <Card className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
        <CardContent className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                Nenhuma simulação executada
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Execute uma simulação na aba Parâmetros para ver os resultados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={result.id} className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                  Simulação #{results.length - index}
                </CardTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {result.runAt.toLocaleString()}
                </p>
              </div>
              <Badge 
                variant={result.stockoutProbability > 10 ? "destructive" : "default"}
                className="px-2 py-1 text-xs"
              >
                {result.stockoutProbability > 10 ? "Alto Risco" : "Baixo Risco"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {result.stockoutProbability}%
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Prob. Ruptura</div>
              </div>
              <div className="text-center p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {result.averageStockLevel}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Estoque Médio</div>
              </div>
              <div className="text-center p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  R$ {result.totalCost.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Custo Total</div>
              </div>
              <div className="text-center p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {result.serviceLevel.toFixed(1)}%
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Nível Serviço</div>
              </div>
            </div>

            {/* Recommendations and Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendations.length > 0 && (
                <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-sm">
                    <Target className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    Recomendações
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 text-xs">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.risks.length > 0 && (
                <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-sm">
                    <AlertTriangle className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    Riscos Identificados
                  </h4>
                  <ul className="space-y-2">
                    {result.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 text-xs">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SimulationResults;
