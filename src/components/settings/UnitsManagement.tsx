
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUnits } from '@/hooks/useUnits';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone,
  Save,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UnitFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
}

const UnitsManagement = () => {
  const { units, refreshUnits } = useUnits();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    code: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUnit) {
        const { error } = await supabase
          .from('units')
          .update(formData)
          .eq('id', editingUnit.id);

        if (error) throw error;

        toast({
          title: 'Unidade atualizada',
          description: 'As informações da unidade foram atualizadas com sucesso.',
        });
        setEditingUnit(null);
      } else {
        const { error } = await supabase
          .from('units')
          .insert([{ ...formData, active: true }]);

        if (error) throw error;

        toast({
          title: 'Unidade criada',
          description: 'A nova unidade foi criada com sucesso.',
        });
        setIsCreateDialogOpen(false);
      }

      resetForm();
      refreshUnits();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar a unidade.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name || '',
      code: unit.code || '',
      address: unit.address || '',
      phone: unit.phone || ''
    });
  };

  const handleDelete = async (unitId: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .update({ active: false })
        .eq('id', unitId);

      if (error) throw error;

      toast({
        title: 'Unidade removida',
        description: 'A unidade foi removida com sucesso.',
      });
      refreshUnits();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a unidade.',
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Gestão de Unidades
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Gerencie as unidades e laboratórios do sistema
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neutral-500" />
              Unidades Cadastradas
            </CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {units.length} unidades ativas no sistema
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-neutral-100">
                  Criar Nova Unidade
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nome da Unidade *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Laboratório Central"
                    required
                    className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Código *
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ex: LAB001"
                    required
                    className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Endereço
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo da unidade"
                    rows={3}
                    className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
                  >
                    {loading ? 'Criando...' : 'Criar Unidade'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                {editingUnit?.id === unit.id ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Nome da Unidade *
                        </Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-code" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Código *
                        </Label>
                        <Input
                          id="edit-code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          required
                          className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-address" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Endereço
                      </Label>
                      <Textarea
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Telefone
                      </Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {loading ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEdit}
                        className="border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-base text-neutral-900 dark:text-neutral-100">
                          {unit.name}
                        </h3>
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          {unit.code}
                        </Badge>
                      </div>
                      {unit.address && (
                        <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{unit.address}</span>
                        </div>
                      )}
                      {unit.phone && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Phone className="h-4 w-4" />
                          <span>{unit.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                        className="border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-neutral-900 dark:text-neutral-100">
                              Remover Unidade
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                              Tem certeza que deseja remover a unidade "{unit.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(unit.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {units.length === 0 && (
              <div className="text-center py-8">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg w-fit mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Nenhuma unidade cadastrada
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Clique em "Nova Unidade" para começar
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitsManagement;
