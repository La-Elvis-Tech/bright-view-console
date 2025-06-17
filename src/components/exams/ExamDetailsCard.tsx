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
      'Hematologia': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800',
      'Bioquímica': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800',
      'Endocrinologia': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-800',
      'Cardiologia': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800',
      'Uroanálise': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-800',
      'Microbiologia': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-800',
    };
    return colors[category] || 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-900/40 dark:text-neutral-200 dark:border-neutral-800';
  };

  return (
    <Card className="group h-full bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/70 dark:hover:shadow-indigo-900/20 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
            <FlaskConical className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
          </div>
          <Badge 
            className={`text-xs font-medium py-1.5 px-3 rounded-full ${getCategoryColor(exam.category)}`}
          >
            {exam.category}
          </Badge>
        </div>
        
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xl leading-tight tracking-tight mb-2">
          {exam.name}
        </h3>
      </CardHeader>

      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex-grow space-y-4">
          {exam.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed mb-4">
              {exam.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium">{exam.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg">
              <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium">R$ {exam.cost?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Preparation Alert */}
          {exam.preparation.requires_preparation && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Requer preparação prévia
              </span>
            </div>
          )}

          {/* Availability Status */}
          <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Disponibilidade:
              </span>
              <span className={`text-sm font-medium ${
                exam.materials_available 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {exam.materials_available ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            {exam.materials_available ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          {/* Material Cost */}
          {exam.total_material_cost > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/70 px-3 py-2 rounded-lg mt-2">
              + R$ {exam.total_material_cost.toFixed(2)} (materiais)
            </div>
          )}
        </div>

        {/* Schedule Button - Agora totalmente integrado */}
        <Button 
          onClick={onSchedule}
          disabled={!exam.materials_available}
          className={`mt-6 py-5 font-medium transition-all duration-300 rounded-xl ${
            exam.materials_available
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-indigo-500/30'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 cursor-not-allowed'
          }`}
        >
          <Calendar className="h-5 w-5 mr-2" />
          {exam.materials_available ? 'Agendar Exame' : 'Materiais Indisponíveis'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsCard;