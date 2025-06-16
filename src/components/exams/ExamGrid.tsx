
import React from 'react';
import { ExamType } from '@/hooks/useExamTypes';
import ExamCard from './ExamCard';

interface ExamGridProps {
  exams: ExamType[];
  loading?: boolean;
}

const ExamGrid: React.FC<ExamGridProps> = ({ exams, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-48 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 dark:text-neutral-500 mb-4">
          <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium mb-2">
          Nenhum exame encontrado
        </p>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Não há exames disponíveis para sua unidade
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
};

export default ExamGrid;
