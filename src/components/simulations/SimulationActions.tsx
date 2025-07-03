
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
    <Card className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-lg font-medium">
          <Zap className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          Executar Simulação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-sm"
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
          <div className="space-y-2 p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>Processando...</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="w-full h-2" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={onScheduleSimulation}
            className="border-neutral-200/60 dark:border-neutral-700/60 bg-white/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            size="sm"
          >
            <Clock className="mr-1 h-3 w-3" />
            <span className="text-xs">Agendar</span>
          </Button>

          <Button
            variant="outline"
            onClick={onSaveScenario}
            className="border-neutral-200/60 dark:border-neutral-700/60 bg-white/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            size="sm"
          >
            <Save className="mr-1 h-3 w-3" />
            <span className="text-xs">Salvar</span>
          </Button>

          <Button
            variant="outline"
            onClick={onExportResults}
            className="border-neutral-200/60 dark:border-neutral-700/60 bg-white/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            size="sm"
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="text-xs">Exportar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

SimulationActions.displayName = 'SimulationActions';

export default SimulationActions;
