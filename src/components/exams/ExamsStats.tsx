
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { ExamDetails } from '@/types/examDetails';

interface ExamsStatsProps {
  examTypes: ExamDetails[];
}

const ExamsStats: React.FC<ExamsStatsProps> = ({ examTypes }) => {
  // Calcular estatísticas dos tipos de exame
  const totalExamTypes = examTypes.length;
  const categoryCounts = examTypes.reduce((acc, exam) => {
    acc[exam.category] = (acc[exam.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageCost = examTypes.length > 0 
    ? examTypes.reduce((sum, exam) => sum + (exam.cost || 0), 0) / examTypes.length 
    : 0;

  const averageDuration = examTypes.length > 0
    ? examTypes.reduce((sum, exam) => sum + exam.duration_minutes, 0) / examTypes.length
    : 0;

  const mostCommonCategory = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const examsWithPreparation = examTypes.filter(exam => exam.preparation.requires_preparation).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total de Tipos</CardTitle>
          <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalExamTypes}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            {examsWithPreparation} requerem preparação
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Custo Médio</CardTitle>
          <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R$ {averageCost.toFixed(2)}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            Por exame
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duração Média</CardTitle>
          <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{Math.round(averageDuration)} min</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            Por exame
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Categoria Principal</CardTitle>
          <Activity className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{mostCommonCategory}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            {categoryCounts[mostCommonCategory] || 0} tipos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsStats;
