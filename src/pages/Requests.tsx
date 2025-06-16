
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
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
    { id: 'all', name: 'Todas as Categorias', count: examTypes.length },
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
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Catálogo de Exames
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Explore e agende os exames disponíveis na sua unidade
        </p>
      </div>

      {/* Stats */}
      <ExamsStats examTypes={examTypes} />

      {/* Filters */}
      <Card className="bg-white/50 dark:bg-neutral-950/30 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do exame..."
                className="pl-10 bg-white dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-80">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700 focus:border-indigo-500 dark:focus:border-indigo-400">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20">
                      <div className="flex items-center justify-between w-full">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      {filteredExams.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-neutral-600 dark:text-neutral-400">
            {filteredExams.length} {filteredExams.length === 1 ? 'exame encontrado' : 'exames encontrados'}
          </p>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Empty State */}
      {filteredExams.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {examTypes.length === 0 
              ? "Nenhum exame disponível"
              : "Nenhum resultado encontrado"
            }
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {examTypes.length === 0 
              ? "Entre em contato com o administrador para adicionar exames à sua unidade."
              : "Tente ajustar os filtros ou termo de busca para encontrar o que procura."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Requests;
