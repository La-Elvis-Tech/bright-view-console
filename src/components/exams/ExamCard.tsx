
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, AlertCircle, FlaskConical } from 'lucide-react';
import { ExamType } from '@/hooks/useExamTypes';

interface ExamCardProps {
  exam: ExamType;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Hematologia': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/50',
      'Bioquímica': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50',
      'Endocrinologia': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50',
      'Cardiologia': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50',
      'Uroanálise': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800/50',
      'Microbiologia': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800/50',
    };
    return colors[category] || 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950/50 dark:text-neutral-300 dark:border-neutral-800/50';
  };

  return (
    <Card className="h-full bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-200 hover:shadow-md group">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/50 transition-colors">
            <FlaskConical className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight mb-1 line-clamp-2">
              {exam.name}
            </h3>
            <Badge className={`text-xs ${getCategoryColor(exam.category)}`}>
              {exam.category}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {exam.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 flex-1 line-clamp-3">
            {exam.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{exam.duration_minutes || 30}min</span>
            </div>
            {exam.cost && (
              <div className="flex items-center gap-1 text-neutral-900 dark:text-neutral-100 font-medium">
                <DollarSign className="h-3.5 w-3.5" />
                <span>R$ {exam.cost.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {exam.requires_preparation && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3" />
              <span>Requer preparação</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
