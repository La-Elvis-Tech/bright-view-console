
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User, Stethoscope, Phone, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Doctor, Unit } from '@/hooks/useSupabaseAppointments';

interface DoctorManagementProps {
  doctors: Doctor[];
  units: Unit[];
  onCreateDoctor: (doctor: {
    name: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }) => Promise<void>;
  onUpdateDoctor: (id: string, doctor: {
    name?: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }) => Promise<void>;
  onDeleteDoctor: (id: string) => Promise<void>;
}

const DoctorManagement: React.FC<DoctorManagementProps> = ({
  doctors,
  units,
  onCreateDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    crm: '',
    email: '',
    phone: '',
    unit_id: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      crm: '',
      email: '',
      phone: '',
      unit_id: '',
    });
    setEditingDoctor(null);
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty || '',
        crm: doctor.crm || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        unit_id: doctor.unit_id || '',
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
      if (editingDoctor) {
        await onUpdateDoctor(editingDoctor.id, formData);
      } else {
        await onCreateDoctor(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (confirm(`Tem certeza que deseja remover o Dr(a). ${doctor.name}?`)) {
      try {
        await onDeleteDoctor(doctor.id);
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const getUnitName = (unitId?: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Não definida';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
              <Stethoscope className="h-5 w-5 text-lab-blue" />
              Gestão de Médicos
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleOpenDialog()}
                  className="bg-lab-blue hover:bg-lab-blue/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Médico
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? 'Editar Médico' : 'Novo Médico'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo do médico"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                      placeholder="Ex: Cardiologia, Neurologia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      value={formData.crm}
                      onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                      placeholder="Número do CRM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit_id">Unidade</Label>
                    <Select value={formData.unit_id} onValueChange={(value) => setFormData(prev => ({ ...prev, unit_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                      className="bg-lab-blue hover:bg-lab-blue/90"
                    >
                      {isSubmitting ? 'Salvando...' : editingDoctor ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {doctors.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum médico cadastrado</p>
                <p className="text-sm">Clique em "Novo Médico" para começar</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <Card key={doctor.id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-lab-lightBlue rounded-lg">
                            <User className="h-4 w-4 text-lab-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              Dr(a). {doctor.name}
                            </h3>
                            {doctor.specialty && (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {doctor.specialty}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {doctor.crm && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <Badge variant="outline">CRM: {doctor.crm}</Badge>
                            </div>
                          )}
                          
                          {doctor.email && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <Mail className="h-3 w-3" />
                              {doctor.email}
                            </div>
                          )}
                          
                          {doctor.phone && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <Phone className="h-3 w-3" />
                              {doctor.phone}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Badge variant="secondary">
                              {getUnitName(doctor.unit_id)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(doctor)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(doctor)}
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

export default DoctorManagement;
