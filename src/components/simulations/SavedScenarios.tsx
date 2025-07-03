
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
      <Card className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
        <CardContent className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Save className="h-6 w-6 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                Nenhum cenário salvo
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Salve cenários na aba Parâmetros para acessá-los aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scenarios.map((scenario) => (
        <Card 
          key={scenario.id} 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm
            ${selectedScenariosForComparison.includes(scenario.id) ? 'ring-1 ring-neutral-300 dark:ring-neutral-600' : ''}`}
          onClick={() => onScenarioSelect(scenario)}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-base text-neutral-900 dark:text-neutral-100">{scenario.name}</CardTitle>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {scenario.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComparison(scenario.id);
                }}
                className={`ml-2 h-8 w-8 p-0 border-neutral-200/60 dark:border-neutral-700/60 ${
                  selectedScenariosForComparison.includes(scenario.id) 
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300' 
                    : ''
                }`}
              >
                <GitCompare className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Demanda:</span>
              <div className="flex items-center gap-1">
                {scenario.demandChange > 0 ? (
                  <ArrowUpCircle className="h-3 w-3 text-green-500" />
                ) : scenario.demandChange < 0 ? (
                  <ArrowDownCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-neutral-500" />
                )}
                <span className={`text-xs font-medium ${
                  scenario.demandChange > 0 ? "text-green-600 dark:text-green-400" : 
                  scenario.demandChange < 0 ? "text-red-600 dark:text-red-400" : 
                  "text-neutral-600 dark:text-neutral-400"
                }`}>
                  {scenario.demandChange > 0 ? '+' : ''}{scenario.demandChange}%
                </span>
              </div>
            </div>
            <Separator className="bg-neutral-200/60 dark:bg-neutral-700/60" />
            <div className="space-y-2 text-xs">
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
