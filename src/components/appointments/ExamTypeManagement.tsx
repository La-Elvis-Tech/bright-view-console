
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Clock, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ExamType } from '@/hooks/useSupabaseAppointments';

interface ExamTypeManagementProps {
  examTypes: ExamType[];
  onCreateExamType: (examType: Omit<ExamType, 'id'>) => Promise<void>;
  onUpdateExamType: (id: string, examType: Partial<ExamType>) => Promise<void>;
  onDeleteExamType: (id: string) => Promise<void>;
}

const ExamTypeManagement: React.FC<ExamTypeManagementProps> = ({
  examTypes,
  onCreateExamType,
  onUpdateExamType,
  onDeleteExamType,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExamType, setEditingExamType] = useState<ExamType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    duration_minutes: 30,
    cost: 0,
    requires_preparation: false,
    preparation_instructions: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      duration_minutes: 30,
      cost: 0,
      requires_preparation: false,
      preparation_instructions: '',
    });
    setEditingExamType(null);
  };

  const handleOpenDialog = (examType?: ExamType) => {
    if (examType) {
      setEditingExamType(examType);
      setFormData({
        name: examType.name,
        category: examType.category || '',
        description: examType.description || '',
        duration_minutes: examType.duration_minutes || 30,
        cost: examType.cost || 0,
        requires_preparation: examType.requires_preparation || false,
        preparation_instructions: examType.preparation_instructions || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingExamType) {
        await onUpdateExamType(editingExamType.id, formData);
        toast({
          title: 'Tipo de exame atualizado',
          description: 'As informações foram atualizadas com sucesso.',
        });
      } else {
        await onCreateExamType(formData);
        toast({
          title: 'Tipo de exame criado',
          description: 'O novo tipo de exame foi adicionado com sucesso.',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as informações do tipo de exame.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (examType: ExamType) => {
    if (confirm(`Tem certeza que deseja remover o tipo de exame "${examType.name}"?`)) {
      try {
        await onDeleteExamType(examType.id);
        toast({
          title: 'Tipo de exame removido',
          description: 'O tipo de exame foi removido com sucesso.',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível remover o tipo de exame.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
              <FileText className="h-5 w-5 text-blue-600" />
              Gestão de Tipos de Exames
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleOpenDialog()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo de Exame
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExamType ? 'Editar Tipo de Exame' : 'Novo Tipo de Exame'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do tipo de exame"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: Cardiologia, Laboratorial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada do exame"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        min="1"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Custo (R$)</Label>
                      <Input
                        id="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_preparation"
                      checked={formData.requires_preparation}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_preparation: checked }))}
                    />
                    <Label htmlFor="requires_preparation">Requer preparação especial</Label>
                  </div>

                  {formData.requires_preparation && (
                    <div className="space-y-2">
                      <Label htmlFor="preparation_instructions">Instruções de preparação</Label>
                      <Textarea
                        id="preparation_instructions"
                        value={formData.preparation_instructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, preparation_instructions: e.target.value }))}
                        placeholder="Instruções detalhadas para preparação do exame"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Salvando...' : editingExamType ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {examTypes.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum tipo de exame cadastrado</p>
                <p className="text-sm">Clique em "Novo Tipo de Exame" para começar</p>
              </div>
            ) : (
              examTypes.map((examType) => (
                <Card key={examType.id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {examType.name}
                            </h3>
                            {examType.category && (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {examType.category}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-2">
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {examType.duration_minutes || 30} minutos
                          </div>
                          
                          {examType.cost && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <span>R$ {examType.cost.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {examType.requires_preparation && (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" />
                              Requer preparação
                            </div>
                          )}
                        </div>

                        {examType.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {examType.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(examType)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(examType)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamTypeManagement;
