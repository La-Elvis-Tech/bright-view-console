
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, Upload, User, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

const LaboratoryProfile = () => {
  const { profile, units, loading, updateProfile, updateAvatar } = useUserProfile();
  const { uploadAvatar, deleteAvatar, uploading } = useAvatarUpload();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    position: profile?.position || '',
    department: profile?.department || '',
    unit_id: profile?.unit_id || '',
  });
  
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        position: profile.position || '',
        department: profile.department || '',
        unit_id: profile.unit_id || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    const avatarUrl = await uploadAvatar(file, profile.id);
    if (avatarUrl) {
      await updateAvatar(avatarUrl);
    }

    event.target.value = '';
  };

  const handleAvatarDelete = async () => {
    if (!profile) return;

    const success = await deleteAvatar(profile.id);
    if (success) {
      await updateAvatar(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactive: 'bg-amber-100 text-amber-700 border-amber-200',
      suspended: 'bg-red-100 text-red-700 border-red-200'
    };
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso'
    };

    return (
      <Badge className={`text-xs ${colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto"></div>
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Carregando perfil...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Perfil do Usuário
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Gerencie suas informações pessoais e profissionais
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-500" />
            Informações Pessoais
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Atualize seus dados pessoais e de contato
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-base bg-neutral-100 dark:bg-neutral-800">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {profile?.full_name || 'Usuário'}
                </h3>
                {profile?.status && getStatusBadge(profile.status)}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-upload">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40" 
                    asChild
                    disabled={uploading}
                  >
                    <span>
                      <Upload className="h-3 w-3 mr-2" />
                      {uploading ? 'Enviando...' : 'Alterar Foto'}
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                {profile?.avatar_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarDelete}
                    disabled={uploading}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <User className="h-3 w-3" />
                Nome Completo
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Digite seu nome completo"
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite seu email"
                disabled
                className="bg-neutral-100/50 dark:bg-neutral-800/50 border-0 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cargo
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ex: Biomédico, Técnico em Laboratório"
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Departamento
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Ex: Hematologia, Bioquímica"
                className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Unidade
              </Label>
              <Select 
                value={formData.unit_id} 
                onValueChange={(value) => handleInputChange('unit_id', value)}
              >
                <SelectTrigger className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Unit Information */}
          {profile?.unit && (
            <Card className="border-0 bg-neutral-50/50 dark:bg-neutral-800/30 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Unidade Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-neutral-500" />
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {profile.unit.name}
                    </span>
                    <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      {profile.unit.code}
                    </Badge>
                  </div>
                  {profile.unit.address && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.unit.address}</span>
                    </div>
                  )}
                  {profile.unit.phone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Phone className="h-4 w-4" />
                      <span>{profile.unit.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-neutral-200/50 dark:border-neutral-700/50 pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LaboratoryProfile;
