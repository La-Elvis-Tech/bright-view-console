
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ScenarioComparisonProps {
  scenarios: SimulationScenario[];
  results: SimulationResult[];
  selectedScenariosForComparison: string[];
  onClearComparison: () => void;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  results,
  selectedScenariosForComparison,
  onClearComparison
}) => {
  const getSelectedScenariosData = () => {
    return selectedScenariosForComparison.map(id => {
      const scenario = scenarios.find(s => s.id === id);
      const result = results.find(r => r.scenarioId === id);
      return { scenario, result };
    }).filter(item => item.scenario);
  };

  if (selectedScenariosForComparison.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="text-center py-16">
          <GitCompare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            Selecione cenários para comparar
          </p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
            Vá para "Cenários Salvos" e clique no ícone de comparação para adicionar cenários.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedScenariosData = getSelectedScenariosData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Comparando {selectedScenariosForComparison.length} cenário(s)
        </h3>
        <Button 
          variant="outline" 
          onClick={onClearComparison}
          className="border-neutral-300 dark:border-neutral-600"
        >
          Limpar Seleção
        </Button>
      </div>

      {/* Tabela de Comparação */}
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Comparação de Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neutral-700 dark:text-neutral-300">Parâmetro</TableHead>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableHead key={scenario?.id} className="text-center text-neutral-700 dark:text-neutral-300">
                    {scenario?.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Mudança na Demanda</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center">
                    <Badge variant={
                      (scenario?.demandChange || 0) > 0 ? "default" : 
                      (scenario?.demandChange || 0) < 0 ? "destructive" : "secondary"
                    }>
                      {(scenario?.demandChange || 0) > 0 ? '+' : ''}{scenario?.demandChange}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Variabilidade Lead Time</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                    {scenario?.leadTimeVariability}%
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Safety Stock</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                    {scenario?.safetyStock} dias
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Orçamento</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                    R$ {scenario?.budgetLimit?.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Nível de Serviço</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                    {scenario?.serviceLevel}%
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Tolerância a Risco</TableCell>
                {selectedScenariosData.map(({ scenario }) => (
                  <TableCell key={scenario?.id} className="text-center">
                    <Badge variant={(scenario?.riskTolerance || 0) > 8 ? "destructive" : "default"}>
                      {scenario?.riskTolerance}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resultados da Comparação */}
      {selectedScenariosData.some(({ result }) => result) && (
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">Resultados das Simulações</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-neutral-700 dark:text-neutral-300">Métrica</TableHead>
                  {selectedScenariosData.map(({ scenario }) => (
                    <TableHead key={scenario?.id} className="text-center text-neutral-700 dark:text-neutral-300">
                      {scenario?.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Prob. Ruptura</TableCell>
                  {selectedScenariosData.map(({ scenario, result }) => (
                    <TableCell key={scenario?.id} className="text-center">
                      {result ? (
                        <Badge variant={result.stockoutProbability > 10 ? "destructive" : "default"}>
                          {result.stockoutProbability}%
                        </Badge>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">N/A</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Estoque Médio</TableCell>
                  {selectedScenariosData.map(({ scenario, result }) => (
                    <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                      {result ? result.averageStockLevel : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Custo Total</TableCell>
                  {selectedScenariosData.map(({ scenario, result }) => (
                    <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                      {result ? `R$ ${result.totalCost.toLocaleString()}` : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Nível de Serviço</TableCell>
                  {selectedScenariosData.map(({ scenario, result }) => (
                    <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                      {result ? `${result.serviceLevel.toFixed(1)}%` : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenarioComparison;
