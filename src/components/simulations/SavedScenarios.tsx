
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, GitCompare, ArrowUpCircle, ArrowDownCircle, Minus } from "lucide-react";

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

interface SavedScenariosProps {
  scenarios: SimulationScenario[];
  selectedScenariosForComparison: string[];
  onScenarioSelect: (scenario: SimulationScenario) => void;
  onToggleComparison: (scenarioId: string) => void;
}

const SavedScenarios: React.FC<SavedScenariosProps> = ({
  scenarios,
  selectedScenariosForComparison,
  onScenarioSelect,
  onToggleComparison
}) => {
  if (scenarios.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="text-center py-16">
          <Save className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            Nenhum cenário salvo ainda
          </p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
            Salve cenários na aba Parâmetros para acessá-los aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scenarios.map((scenario) => (
        <Card 
          key={scenario.id} 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800
            ${selectedScenariosForComparison.includes(scenario.id) ? 'ring-2 ring-neutral-400 dark:ring-neutral-600' : ''}`}
          onClick={() => onScenarioSelect(scenario)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">{scenario.name}</CardTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Criado em {scenario.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComparison(scenario.id);
                }}
                className={`ml-2 ${
                  selectedScenariosForComparison.includes(scenario.id) 
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300' 
                    : ''
                }`}
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Demanda:</span>
                <div className="flex items-center gap-1">
                  {scenario.demandChange > 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  ) : scenario.demandChange < 0 ? (
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-neutral-500" />
                  )}
                  <span className={scenario.demandChange > 0 ? "text-green-600 dark:text-green-400" : 
                                 scenario.demandChange < 0 ? "text-red-600 dark:text-red-400" : 
                                 "text-neutral-600 dark:text-neutral-400"}>
                    {scenario.demandChange > 0 ? '+' : ''}{scenario.demandChange}%
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Safety Stock:</span>
                <span className="text-neutral-900 dark:text-neutral-100">{scenario.safetyStock} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">SLA Target:</span>
                <span className="text-neutral-900 dark:text-neutral-100">{scenario.serviceLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Orçamento:</span>
                <span className="text-neutral-900 dark:text-neutral-100">R$ {scenario.budgetLimit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedScenarios;
