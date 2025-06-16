
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, AlertCircle, Calendar, FlaskConical } from 'lucide-react';
import { ExamDetails } from '@/types/examDetails';

interface ExamDetailsCardProps {
  exam: ExamDetails;
  onSchedule: () => void;
}

const ExamDetailsCard: React.FC<ExamDetailsCardProps> = ({ exam, onSchedule }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Hematologia': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      'Bioquímica': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'Endocrinologia': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'Cardiologia': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'Uroanálise': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      'Microbiologia': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
    };
    return colors[category] || 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900/20 dark:text-neutral-300 dark:border-neutral-800';
  };

  return (
    <Card className="h-full bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                <FlaskConical className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight truncate">
                {exam.name}
              </h3>
            </div>
            <Badge className={`text-xs ${getCategoryColor(exam.category)}`}>
              {exam.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex flex-col h-full">
        <div className="flex-1">
          {exam.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
              {exam.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{exam.duration_minutes}min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span>R$ {exam.cost?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {exam.preparation.requires_preparation && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-3">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Requer preparação</span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Materiais disponíveis</span>
              <span className={`text-xs font-medium ${
                exam.materials_available 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {exam.materials_available ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            <div className={`h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden ${
              exam.materials_available ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <div className={`h-full rounded-full ${
                exam.materials_available 
                  ? 'bg-green-500 dark:bg-green-400 w-full' 
                  : 'bg-red-500 dark:bg-red-400 w-0'
              }`} />
            </div>
          </div>

          {exam.total_material_cost > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Custo dos materiais: R$ {exam.total_material_cost.toFixed(2)}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Button 
            onClick={onSchedule}
            disabled={!exam.materials_available}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-400 text-sm py-2"
          >
            <Calendar className="h-3.5 w-3.5 mr-2" />
            {exam.materials_available ? 'Agendar Exame' : 'Materiais Indisponíveis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsCard;
