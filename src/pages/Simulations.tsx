
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
    <div ref={containerRef} className="min-h-screen">
      <div className="p-2 md:p-6 max-w-7xl mx-auto space-y-8 simulation-container">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Simulações de Estoque
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Modele cenários e otimize políticas de reabastecimento
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-lg backdrop-blur-sm">
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-neutral-200/40 dark:border-neutral-800/40 h-12 p-1 rounded-t-lg rounded-b-none">
              <TabsTrigger 
                value="parameters" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium"
              >
                <Target className="h-4 w-4 inline md:mr-2" />
                <span className="hidden md:inline">Parâmetros</span>
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4 inline md:mr-2" />
                <span className="hidden md:inline">Resultados</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scenarios" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium"
              >
                <Save className="h-4 w-4 inline md:mr-2" />
                <span className="hidden md:inline">Cenários Salvos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium"
              >
                <Calendar className="h-4 w-4 inline md:mr-2" />
                <span className="hidden md:inline">Agendadas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium"
              >
                <GitCompare className="h-4 w-4 inline md:mr-2" />
                <span className="hidden md:inline">Comparação</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="parameters" className="space-y-6 mt-0">
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

              <TabsContent value="results" className="space-y-6 mt-0">
                <SimulationResults results={results} />
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-6 mt-0">
                <SavedScenarios
                  scenarios={scenarios}
                  selectedScenariosForComparison={selectedScenariosForComparison}
                  onScenarioSelect={setCurrentScenario}
                  onToggleComparison={toggleScenarioForComparison}
                />
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-6 mt-0">
                <ScheduledSimulations
                  scenarios={scenarios}
                  onScheduleCreate={handleScheduleCreate}
                />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6 mt-0">
                <ScenarioComparison
                  scenarios={scenarios}
                  results={results}
                  selectedScenariosForComparison={selectedScenariosForComparison}
                  onClearComparison={clearComparison}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Simulations;
