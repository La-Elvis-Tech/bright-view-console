
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, FileText, Calendar } from 'lucide-react';

interface ExamDetailsCardProps {
  exam: any;
  onSchedule: () => void;
}

const ExamDetailsCard: React.FC<ExamDetailsCardProps> = ({ exam, onSchedule }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Hematologia': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800',
      'Bioquímica': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800',
      'Endocrinologia': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800',
      'Cardiologia': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-800',
      'Uroanálise': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800',
      'Microbiologia': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800',
    };
    return colors[category as keyof typeof colors] || 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-300 dark:border-neutral-800';
  };

  return (
    <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-neutral-900/60 transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2">
                {exam.name}
              </h3>
              <Badge className={`text-xs border ${getCategoryColor(exam.category)} shrink-0`}>
                {exam.category}
              </Badge>
            </div>
            
            {exam.description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {exam.description}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {exam.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-neutral-400" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {exam.duration_minutes}min
                </span>
              </div>
            )}
            
            {exam.cost && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-neutral-400" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(exam.cost)}
                </span>
              </div>
            )}
            
            {exam.requires_preparation && (
              <div className="flex items-center gap-2 col-span-2">
                <FileText className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Requer preparo
                </span>
              </div>
            )}
          </div>

          {/* Materials Info */}
          {exam.materials && exam.materials.length > 0 && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {exam.materials.length} {exam.materials.length === 1 ? 'material necessário' : 'materiais necessários'}
              </p>
            </div>
          )}

          {/* Schedule Button */}
          <Button
            onClick={onSchedule}
            size="sm"
            className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-xs h-8"
          >
            <Calendar className="w-3 h-3 mr-2" />
            Agendar Exame
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsCard;
