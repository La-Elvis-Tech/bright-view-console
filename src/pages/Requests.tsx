
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExamsStats from '@/components/exams/ExamsStats';
import ExamDetailsCard from '@/components/exams/ExamDetailsCard';
import RecentExamsSection from '@/components/exams/RecentExamsSection';
import { useQuery } from '@tanstack/react-query';
import { examDetailsService } from '@/services/examDetailsService';
import { SkeletonExams } from '@/components/ui/skeleton-exams';
import { useAuthContext } from '@/context/AuthContext';

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { profile } = useAuthContext();

  const { data: detailedExams, isLoading, error } = useQuery({
    queryKey: ['detailed-exams', profile?.unit_id],
    queryFn: () => examDetailsService.getAllExamsWithMaterials(),
    retry: 3,
    retryDelay: 1000,
    enabled: !!profile
  });

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
    return (
      <div className="min-h-screen bg-neutral-50/30 dark:bg-neutral-950/30">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Card className="border-0 bg-white/60 dark:bg-neutral-900/30 backdrop-blur-sm shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-red-500 dark:text-red-400 mb-2">Erro ao carregar exames</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Tente recarregar a página
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Catálogo de Exames
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Explore e agende os exames disponíveis na sua unidade
          </p>
        </div>

        {/* Stats */}
        <ExamsStats examTypes={examTypes} />

        {/* Recent Exams Section */}
        <RecentExamsSection />

        {/* Filters */}
        <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome do exame..."
                  className="pl-10 border-0 bg-white/60 dark:bg-neutral-800/40 focus:bg-white dark:focus:bg-neutral-800/60 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="lg:w-80">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-0 bg-white/60 dark:bg-neutral-800/40 focus:bg-white dark:focus:bg-neutral-800/60">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category.name}</span>
                          <Badge variant="secondary" className="ml-2 bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-0">
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
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Exames Disponíveis
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {filteredExams.length} {filteredExams.length === 1 ? 'exame encontrado' : 'exames encontrados'}
            </p>
          </div>
        )}

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <ExamDetailsCard
              key={exam.id}
              exam={exam}
              onSchedule={() => {
                console.log('Agendar exame:', exam.name);
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredExams.length === 0 && !isLoading && (
          <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
            <CardContent className="p-16 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100/80 dark:bg-neutral-800/40 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {examTypes.length === 0 
                  ? "Nenhum exame disponível"
                  : "Nenhum resultado encontrado"
                }
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                {examTypes.length === 0 
                  ? "Entre em contato com o administrador para adicionar exames à sua unidade."
                  : "Tente ajustar os filtros ou termo de busca para encontrar o que procura."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Requests;
