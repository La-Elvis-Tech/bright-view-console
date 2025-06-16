
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, AlertCircle, Calendar, FlaskConical, CheckCircle, XCircle } from 'lucide-react';
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
    <Card className="group h-full bg-white/70 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 backdrop-blur-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <FlaskConical className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <Badge className={`text-xs font-medium ${getCategoryColor(exam.category)}`}>
            {exam.category}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg leading-tight">
          {exam.name}
        </h3>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex flex-col h-full">
        <div className="flex-1 space-y-4">
          {exam.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {exam.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{exam.duration_minutes}min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <DollarSign className="h-4 w-4 text-indigo-500" />
              <span>R$ {exam.cost?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Preparation Alert */}
          {exam.preparation.requires_preparation && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Requer preparação prévia
              </span>
            </div>
          )}

          {/* Materials Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Disponibilidade
              </span>
              <div className="flex items-center gap-2">
                {exam.materials_available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  exam.materials_available 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {exam.materials_available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
            
            <div className={`h-2 rounded-full overflow-hidden ${
              exam.materials_available 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <div className={`h-full transition-all duration-500 ${
                exam.materials_available 
                  ? 'bg-green-500 dark:bg-green-400 w-full' 
                  : 'bg-red-500 dark:bg-red-400 w-0'
              }`} />
            </div>
          </div>

          {/* Material Cost */}
          {exam.total_material_cost > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 rounded-lg">
              Custo dos materiais: R$ {exam.total_material_cost.toFixed(2)}
            </div>
          )}
        </div>

        {/* Schedule Button */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button 
            onClick={onSchedule}
            disabled={!exam.materials_available}
            className={`w-full py-2.5 font-medium transition-all duration-200 ${
              exam.materials_available
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {exam.materials_available ? 'Agendar Exame' : 'Materiais Indisponíveis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsCard;
