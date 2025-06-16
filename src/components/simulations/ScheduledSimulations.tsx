
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Bell
} from "lucide-react";

type FrequencyType = 'daily' | 'weekly' | 'monthly';

interface ScheduledSimulation {
  id: string;
  name: string;
  scenarioId: string;
  frequency: FrequencyType;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  alertThreshold: number;
  notifyOnCritical: boolean;
  createdAt: Date;
}

interface ScheduledSimulationsProps {
  scenarios: any[];
  onScheduleCreate: (schedule: Omit<ScheduledSimulation, 'id' | 'createdAt'>) => void;
}

const ScheduledSimulations: React.FC<ScheduledSimulationsProps> = ({
  scenarios,
  onScheduleCreate
}) => {
  const [scheduledSims, setScheduledSims] = useState<ScheduledSimulation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    scenarioId: '',
    frequency: 'weekly' as FrequencyType,
    alertThreshold: 15,
    notifyOnCritical: true
  });
  const { toast } = useToast();

  const createSchedule = () => {
    if (!newSchedule.name || !newSchedule.scenarioId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const nextRun = new Date();
    switch (newSchedule.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    const schedule: ScheduledSimulation = {
      id: Date.now().toString(),
      ...newSchedule,
      isActive: true,
      nextRun,
      createdAt: new Date()
    };

    setScheduledSims(prev => [schedule, ...prev]);
    onScheduleCreate(schedule);
    
    setNewSchedule({
      name: '',
      scenarioId: '',
      frequency: 'weekly',
      alertThreshold: 15,
      notifyOnCritical: true
    });
    setIsDialogOpen(false);

    toast({
      title: "Simulação agendada",
      description: `"${schedule.name}" foi agendada com sucesso.`,
    });
  };

  const toggleSimulation = (id: string) => {
    setScheduledSims(prev => prev.map(sim => 
      sim.id === id ? { ...sim, isActive: !sim.isActive } : sim
    ));
    
    const sim = scheduledSims.find(s => s.id === id);
    toast({
      title: sim?.isActive ? "Simulação pausada" : "Simulação ativada",
      description: `A simulação foi ${sim?.isActive ? 'pausada' : 'ativada'}.`,
    });
  };

  const deleteSimulation = (id: string) => {
    setScheduledSims(prev => prev.filter(sim => sim.id !== id));
    toast({
      title: "Simulação removida",
      description: "O agendamento foi removido com sucesso.",
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return frequency;
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
            <Clock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <p className='text-sm xl:text-xl'>Simulações Agendadas</p>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-neutral-300 dark:border-neutral-600"
              >
                Nova Simulação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-neutral-100">
                  Agendar Nova Simulação
                </DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                  Configure uma simulação para ser executada automaticamente
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-neutral-700 dark:text-neutral-300">Nome da Simulação</Label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Monitoramento Semanal"
                    className="w-full mt-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <Label className="text-neutral-700 dark:text-neutral-300">Cenário Base</Label>
                  <Select 
                    value={newSchedule.scenarioId} 
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, scenarioId: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
                      <SelectValue placeholder="Selecione um cenário" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-700 dark:text-neutral-300">Frequência</Label>
                  <Select 
                    value={newSchedule.frequency} 
                    onValueChange={(value: FrequencyType) => setNewSchedule(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-700 dark:text-neutral-300">
                    Limite de Alerta (% de risco de ruptura)
                  </Label>
                  <input
                    type="number"
                    value={newSchedule.alertThreshold}
                    onChange={(e) => setNewSchedule(prev => ({ 
                      ...prev, 
                      alertThreshold: parseInt(e.target.value) || 15 
                    }))}
                    min="1"
                    max="50"
                    className="w-full mt-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-neutral-700 dark:text-neutral-300">
                      Notificar em casos críticos
                    </Label>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Enviar notificação quando o risco exceder o limite
                    </p>
                  </div>
                  <Switch
                    checked={newSchedule.notifyOnCritical}
                    onCheckedChange={(checked) => setNewSchedule(prev => ({ 
                      ...prev, 
                      notifyOnCritical: checked 
                    }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createSchedule} className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900">
                  Agendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {scheduledSims.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              Nenhuma simulação agendada
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Crie simulações automáticas para monitoramento contínuo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledSims.map((sim) => (
              <div 
                key={sim.id} 
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      {sim.name}
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {getFrequencyLabel(sim.frequency)} • Próxima: {sim.nextRun.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sim.isActive ? "default" : "secondary"}>
                      {sim.isActive ? "Ativa" : "Pausada"}
                    </Badge>
                    {sim.notifyOnCritical && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Bell className="h-3 w-3 mr-1" />
                        Alertas
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Limite de alerta: {sim.alertThreshold}%
                    {sim.lastRun && (
                      <span className="ml-4">
                        Última execução: {sim.lastRun.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSimulation(sim.id)}
                      className="border-neutral-300 dark:border-neutral-600"
                    >
                      {sim.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSimulation(sim.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledSimulations;
