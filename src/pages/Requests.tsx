
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExamsStats from '@/components/exams/ExamsStats';
import ExamDetailsCard from '@/components/exams/ExamDetailsCard';
import { useQuery } from '@tanstack/react-query';
import { examDetailsService } from '@/services/examDetailsService';
import { SkeletonExams } from '@/components/ui/skeleton-exams';
import { useAuthContext } from '@/context/AuthContext';

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { profile } = useAuthContext();

  // Buscar exames filtrados por unidade do usuário
  const { data: detailedExams, isLoading, error } = useQuery({
    queryKey: ['detailed-exams', profile?.unit_id],
    queryFn: () => examDetailsService.getAllExamsWithMaterials(),
    retry: 3,
    retryDelay: 1000,
    enabled: !!profile
  });

  console.log('Detailed exams data:', detailedExams);
  console.log('Loading state:', isLoading);
  console.log('Error:', error);
  console.log('User unit_id:', profile?.unit_id);

  // Usar os dados detalhados diretamente
  const examTypes = detailedExams || [];

  const categories = [
    { id: 'all', name: 'Todos', count: examTypes.length },
    { id: 'Hematologia', name: 'Hematologia', count: examTypes.filter(e => e.category === 'Hematologia').length },
    { id: 'Bioquímica', name: 'Bioquímica', count: examTypes.filter(e => e.category === 'Bioquímica').length },
    { id: 'Endocrinologia', name: 'Endocrinologia', count: examTypes.filter(e => e.category === 'Endocrinologia').length },
    { id: 'Cardiologia', name: 'Cardiologia', count: examTypes.filter(e => e.category === 'Cardiologia').length },
    { id: 'Uroanálise', name: 'Uroanálise', count: examTypes.filter(e => e.category === 'Uroanálise').length },
    { id: 'Microbiologia', name: 'Microbiologia', count: examTypes.filter(e => e.category === 'Microbiologia').length },
  ];

  const filteredExams = examTypes.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <SkeletonExams />;
  }

  if (error) {
    console.error('Error loading exams:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">Erro ao carregar exames</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Tente recarregar a página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Tipos de Exames
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Gerencie os tipos de exames disponíveis na sua unidade
        </p>
      </div>

      <ExamsStats examTypes={examTypes} />

      {/* Filters */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 transform text-neutral-400" size={18} />
              <Input
                placeholder="Buscar exame..."
                className="pl-10 w-full rounded-md bg-white dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-2 rounded-md transition-colors ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExams.map((exam) => (
          <ExamDetailsCard
            key={exam.id}
            exam={exam}
            onSchedule={() => {
              // TODO: Implementar navegação para agendamento
              console.log('Agendar exame:', exam.name);
            }}
          />
        ))}
      </div>

      {filteredExams.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-neutral-400 dark:text-neutral-500 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium mb-2">
            {examTypes.length === 0 
              ? "Nenhum exame encontrado na sua unidade"
              : "Nenhum exame encontrado com os filtros aplicados"
            }
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {examTypes.length === 0 
              ? "Entre em contato com o administrador para adicionar exames à sua unidade."
              : "Tente ajustar os filtros ou termo de busca."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Requests;
