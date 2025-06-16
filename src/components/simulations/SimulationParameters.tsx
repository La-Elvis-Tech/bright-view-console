
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign 
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

interface SimulationParametersProps {
  currentScenario: SimulationScenario;
  setCurrentScenario: (scenario: SimulationScenario | ((prev: SimulationScenario) => SimulationScenario)) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  applyTemplate: (templateKey: string) => void;
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

const SimulationParameters: React.FC<SimulationParametersProps> = memo(({
  currentScenario,
  setCurrentScenario,
  selectedTemplate,
  setSelectedTemplate,
  applyTemplate
}) => {
  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
            Templates de Cenário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Select value={selectedTemplate} onValueChange={(value) => {
            setSelectedTemplate(value);
            applyTemplate(value);
          }}>
            <SelectTrigger className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
              <SelectValue placeholder="Selecione um template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Cenário Personalizado</SelectItem>
              <SelectItem value="seasonal-growth">Crescimento Sazonal</SelectItem>
              <SelectItem value="supplier-crisis">Crise de Fornecimento</SelectItem>
              <SelectItem value="new-exam-demand">Novo Exame em Alta</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Parâmetros de Entrada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demanda */}
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <TrendingUp className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              Variação de Demanda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Nome do Cenário</Label>
              <Input
                value={currentScenario.name}
                onChange={(e) => setCurrentScenario(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Ex: Cenário COVID-19"
                className="mt-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
              />
            </div>
            
            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Mudança na Demanda (%)</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.demandChange]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    demandChange: value
                  }))}
                  max={50}
                  min={-30}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>-30%</span>
                <Badge variant={currentScenario.demandChange > 0 ? "default" : currentScenario.demandChange < 0 ? "destructive" : "secondary"}>
                  {currentScenario.demandChange > 0 ? '+' : ''}{currentScenario.demandChange}%
                </Badge>
                <span>+50%</span>
              </div>
            </div>

            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Fator de Sazonalidade</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.seasonalityFactor]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    seasonalityFactor: value
                  }))}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>0.5x</span>
                <Badge variant="outline">{currentScenario.seasonalityFactor}x</Badge>
                <span>2.0x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Time e Fornecedores */}
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <Calendar className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              Lead Time & Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Variabilidade do Lead Time (%)</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.leadTimeVariability]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    leadTimeVariability: value
                  }))}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>5%</span>
                <Badge variant={currentScenario.leadTimeVariability > 35 ? "destructive" : "default"}>
                  {currentScenario.leadTimeVariability}%
                </Badge>
                <span>60%</span>
              </div>
            </div>

            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Safety Stock (dias)</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.safetyStock]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    safetyStock: value
                  }))}
                  max={21}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>3 dias</span>
                <Badge variant="outline">{currentScenario.safetyStock} dias</Badge>
                <span>21 dias</span>
              </div>
            </div>

            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Tolerância a Risco (%)</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.riskTolerance]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    riskTolerance: value
                  }))}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>1%</span>
                <Badge variant={currentScenario.riskTolerance > 8 ? "destructive" : "default"}>
                  {currentScenario.riskTolerance}%
                </Badge>
                <span>15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orçamento e SLA */}
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <DollarSign className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              Orçamento & SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Orçamento Mensal (R$)</Label>
              <Input
                type="number"
                value={currentScenario.budgetLimit}
                onChange={(e) => setCurrentScenario(prev => ({
                  ...prev,
                  budgetLimit: parseFloat(e.target.value) || 0
                }))}
                placeholder="50000"
                className="mt-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
              />
            </div>

            <div>
              <Label className="text-neutral-700 dark:text-neutral-300">Nível de Serviço Target (%)</Label>
              <div className="px-3 mt-3">
                <Slider
                  value={[currentScenario.serviceLevel]}
                  onValueChange={([value]) => setCurrentScenario(prev => ({
                    ...prev,
                    serviceLevel: value
                  }))}
                  max={99}
                  min={85}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span>85%</span>
                <Badge variant={currentScenario.serviceLevel >= 95 ? "default" : "secondary"}>
                  {currentScenario.serviceLevel}%
                </Badge>
                <span>99%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SimulationParameters.displayName = 'SimulationParameters';

export default SimulationParameters;
