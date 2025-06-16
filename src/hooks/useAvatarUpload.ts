
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione um arquivo de imagem.');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('O arquivo deve ter no máximo 5MB.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast({
        title: 'Sucesso',
        description: 'Foto do perfil atualizada com sucesso!',
      });

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (userId: string): Promise<boolean> => {
    try {
      setUploading(true);

      // Find all files for this user
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${userId}/${file.name}`);
        
        const { error } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Foto do perfil removida com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a foto do perfil.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    deleteAvatar,
    uploading
  };
};
