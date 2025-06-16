
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSimulation } from "@/hooks/useSimulation";

// Import refactored components
import SimulationParameters from "@/components/simulations/SimulationParameters";
import SimulationActions from "@/components/simulations/SimulationActions";
import SimulationResults from "@/components/simulations/SimulationResults";
import SavedScenarios from "@/components/simulations/SavedScenarios";
import ScenarioComparison from "@/components/simulations/ScenarioComparison";
import ScheduledSimulations from "@/components/simulations/ScheduledSimulations";

import { 
  Target,
  BarChart3,
  Save,
  Calendar,
  GitCompare
} from "lucide-react";

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

const templates = {
  "seasonal-growth": {
    name: "Crescimento Sazonal",
    demandChange: 25,
    leadTimeVariability: 15,
    safetyStock: 10,
    budgetLimit: 75000,
    serviceLevel: 98,
    seasonalityFactor: 1.3,
    riskTolerance: 3
  },
  "supplier-crisis": {
    name: "Crise de Fornecimento",
    demandChange: -10,
    leadTimeVariability: 45,
    safetyStock: 14,
    budgetLimit: 40000,
    serviceLevel: 90,
    seasonalityFactor: 1,
    riskTolerance: 8
  },
  "new-exam-demand": {
    name: "Novo Exame em Alta",
    demandChange: 40,
    leadTimeVariability: 25,
    safetyStock: 12,
    budgetLimit: 60000,
    serviceLevel: 96,
    seasonalityFactor: 1.1,
    riskTolerance: 4
  }
};

const Simulations = () => {
  const { scenarios, results, isRunning, runSimulation, saveScenario } = useSimulation();
  const [selectedScenariosForComparison, setSelectedScenariosForComparison] = useState<string[]>([]);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>({
    id: "",
    name: "Cenário Padrão",
    demandChange: 0,
    leadTimeVariability: 20,
    safetyStock: 7,
    budgetLimit: 50000,
    serviceLevel: 95,
    seasonalityFactor: 1,
    riskTolerance: 5,
    createdAt: new Date()
  });
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const containerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".simulation-container > *",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const applyTemplate = (templateKey: string) => {
    if (templateKey === "custom") return;
    
    const template = templates[templateKey as keyof typeof templates];
    setCurrentScenario(prev => ({
      ...prev,
      ...template,
      name: template.name
    }));
    
    toast({
      title: "Template aplicado",
      description: `Cenário "${template.name}" foi carregado com sucesso.`,
    });
  };

  const handleRunSimulation = async () => {
    await runSimulation(currentScenario);
  };

  const handleSaveScenario = () => {
    saveScenario(currentScenario);
  };

  const exportResults = () => {
    toast({
      title: "Relatório exportado",
      description: "Resultados da simulação foram exportados em PDF.",
    });
  };

  const scheduleSimulation = () => {
    toast({
      title: "Funcionalidade disponível",
      description: "Acesse a aba 'Simulações Agendadas' para configurar execuções automáticas.",
    });
  };

  const toggleScenarioForComparison = (scenarioId: string) => {
    setSelectedScenariosForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else if (prev.length < 3) {
        return [...prev, scenarioId];
      } else {
        toast({
          title: "Limite excedido",
          description: "Máximo de 3 cenários para comparação.",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  const clearComparison = () => {
    setSelectedScenariosForComparison([]);
  };

  const handleScheduleCreate = (schedule: any) => {
    console.log("Nova simulação agendada:", schedule);
  };

  return (
    <div ref={containerRef} className="space-y-6 simulation-container">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Simulações de Estoque
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Modele cenários e otimize políticas de reabastecimento
        </p>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger value="parameters" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <Target className="inline md:hidden" />
            <p className="hidden md:inline">Parâmetros</p>
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <BarChart3 className="inline md:hidden" />
            <p className="hidden md:inline">Resultados</p>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <Save className="inline md:hidden" />
            <p className="hidden md:inline">Cenários Salvos</p>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <Calendar className="inline md:hidden" />
            <p className="hidden md:inline">Agendadas</p>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <GitCompare className="inline md:hidden" />
            <p className="hidden md:inline">Comparação</p>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <SimulationParameters
              currentScenario={currentScenario}
              setCurrentScenario={setCurrentScenario}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              applyTemplate={applyTemplate}
            />
            <SimulationActions
              isRunning={isRunning}
              onRunSimulation={handleRunSimulation}
              onSaveScenario={handleSaveScenario}
              onExportResults={exportResults}
              onScheduleSimulation={scheduleSimulation}
            />
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <SimulationResults results={results} />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <SavedScenarios
            scenarios={scenarios}
            selectedScenariosForComparison={selectedScenariosForComparison}
            onScenarioSelect={setCurrentScenario}
            onToggleComparison={toggleScenarioForComparison}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledSimulations
            scenarios={scenarios}
            onScheduleCreate={handleScheduleCreate}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <ScenarioComparison
            scenarios={scenarios}
            results={results}
            selectedScenariosForComparison={selectedScenariosForComparison}
            onClearComparison={clearComparison}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;
