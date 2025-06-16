
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Save, Download, RefreshCw, Zap, Clock } from "lucide-react";

interface SimulationActionsProps {
  isRunning: boolean;
  onRunSimulation: () => void;
  onSaveScenario: () => void;
  onExportResults: () => void;
  onScheduleSimulation: () => void;
}

const SimulationActions: React.FC<SimulationActionsProps> = memo(({
  isRunning,
  onRunSimulation,
  onSaveScenario,
  onExportResults,
  onScheduleSimulation,
}) => {
  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <Zap className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          Executar Simulação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900"
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Executar Simulação
            </>
          )}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>Processando...</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="w-full" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={onScheduleSimulation}
            className="border-neutral-300 dark:border-neutral-600"
            size="lg"
          >
            <Clock className="mr-2 h-4 w-4" />
            Agendar
          </Button>

          <Button
            variant="outline"
            onClick={onSaveScenario}
            className="border-neutral-300 dark:border-neutral-600"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>

          <Button
            variant="outline"
            onClick={onExportResults}
            className="border-neutral-300 dark:border-neutral-600"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

SimulationActions.displayName = 'SimulationActions';

export default SimulationActions;
