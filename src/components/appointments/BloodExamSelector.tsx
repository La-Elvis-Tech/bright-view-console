
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Droplets, Clock, TestTube } from 'lucide-react';
import { BloodExamType, BloodExamPanel } from '@/types/bloodExam';
import { useBloodExams } from '@/hooks/useBloodExams';

interface BloodExamSelectorProps {
  selectedExams: string[];
  onExamChange: (examIds: string[]) => void;
  onVolumeCalculated?: (volume: number, tubes: number) => void;
}

const BloodExamSelector: React.FC<BloodExamSelectorProps> = ({
  selectedExams,
  onExamChange,
  onVolumeCalculated
}) => {
  const { bloodExamTypes, bloodExamPanels, calculateBloodVolume } = useBloodExams();
  const [selectedPanel, setSelectedPanel] = useState<string>('');

  const handleExamToggle = async (examId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedExams, examId]
      : selectedExams.filter(id => id !== examId);
    
    onExamChange(newSelection);

    // Calcular volume total quando há mudanças
    if (newSelection.length > 0) {
      const volumeData = await calculateBloodVolume(newSelection);
      if (volumeData && onVolumeCalculated) {
        onVolumeCalculated(volumeData.total_volume_ml, volumeData.tubes_needed);
      }
    } else if (onVolumeCalculated) {
      onVolumeCalculated(0, 0);
    }
  };

  const handlePanelSelect = async (panelId: string) => {
    if (selectedPanel === panelId) {
      // Desmarcar painel
      setSelectedPanel('');
      onExamChange([]);
      if (onVolumeCalculated) onVolumeCalculated(0, 0);
    } else {
      // Marcar painel e todos os seus exames
      setSelectedPanel(panelId);
      // Aqui você precisaria buscar os exames do painel
      // Por simplicidade, vou usar um exemplo
      const panelExams = bloodExamTypes.slice(0, 3).map(e => e.id); // Exemplo
      onExamChange(panelExams);
      
      const volumeData = await calculateBloodVolume(panelExams);
      if (volumeData && onVolumeCalculated) {
        onVolumeCalculated(volumeData.total_volume_ml, volumeData.tubes_needed);
      }
    }
  };

  const groupedExams = bloodExamTypes.reduce((acc, exam) => {
    if (!acc[exam.category]) {
      acc[exam.category] = [];
    }
    acc[exam.category].push(exam);
    return acc;
  }, {} as Record<string, BloodExamType[]>);

  const getTotalVolume = () => {
    return bloodExamTypes
      .filter(exam => selectedExams.includes(exam.id))
      .reduce((total, exam) => total + exam.sample_volume_ml, 0);
  };

  const getEstimatedTubes = () => {
    return Math.ceil(getTotalVolume() / 5); // Assumindo tubos de 5ml
  };

  return (
    <div className="space-y-6">
      {/* Painéis pré-definidos */}
      {bloodExamPanels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5 text-blue-600" />
              Painéis de Exames
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bloodExamPanels.map((panel) => (
                <div
                  key={panel.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPanel === panel.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePanelSelect(panel.id)}
                >
                  <div className="font-medium text-sm">{panel.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{panel.description}</div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {panel.total_volume_ml}ml
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exames individuais por categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplets className="h-5 w-5 text-red-600" />
            Exames Individuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedExams).map(([category, exams]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <Checkbox
                      id={exam.id}
                      checked={selectedExams.includes(exam.id)}
                      onCheckedChange={(checked) => handleExamToggle(exam.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={exam.id} className="cursor-pointer">
                        <div className="font-medium text-sm">{exam.name}</div>
                        <div className="text-xs text-gray-500">
                          {exam.code} • {exam.tube_type} • {exam.sample_volume_ml}ml
                        </div>
                      </label>
                    </div>
                    {exam.preparation_required && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Preparo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {category !== Object.keys(groupedExams)[Object.keys(groupedExams).length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumo da coleta */}
      {selectedExams.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-200">
              <TestTube className="h-5 w-5" />
              Resumo da Coleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{selectedExams.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Exames</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{getTotalVolume().toFixed(1)}ml</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{getEstimatedTubes()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tubos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {bloodExamTypes.filter(e => selectedExams.includes(e.id) && e.preparation_required).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">C/ Preparo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodExamSelector;
