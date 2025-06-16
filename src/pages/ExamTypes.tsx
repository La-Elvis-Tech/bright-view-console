
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useAuthContext } from '@/context/AuthContext';
import ExamGrid from '@/components/exams/ExamGrid';

const ExamTypes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { examTypes, loading } = useExamTypes();
  const { profile } = useAuthContext();

  console.log('User profile:', profile);
  console.log('Exam types:', examTypes);
  console.log('Loading:', loading);

  // Filtrar exames por unidade do usuário (já filtrado no hook)
  const filteredExams = examTypes.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calcular categorias disponíveis
  const categories = [
    { id: 'all', name: 'Todos', count: examTypes.length },
    ...Array.from(new Set(examTypes.map(e => e.category).filter(Boolean)))
      .map(category => ({
        id: category,
        name: category,
        count: examTypes.filter(e => e.category === category).length
      }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Tipos de Exames
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Gerencie os tipos de exames disponíveis na sua unidade
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {examTypes.length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Total de Exames
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {categories.length - 1}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Categorias
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {examTypes.filter(e => !e.requires_preparation).length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Sem Preparação
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {examTypes.filter(e => e.requires_preparation).length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Com Preparação
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 transform text-neutral-400" size={18} />
              <Input
                placeholder="Buscar exame por nome ou descrição..."
                className="pl-10 bg-white dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-current border-none">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      <ExamGrid exams={filteredExams} loading={loading} />
    </div>
  );
};

export default ExamTypes;
