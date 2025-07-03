
import React from 'react';
import { useQueuedOperation } from '@/hooks/useQueuedOperation';
import { QueueManager } from '@/components/queue/QueueManager';
import { useToast } from '@/hooks/use-toast';

// Exemplo de como integrar o sistema de fila em operações de inventário
export const useInventoryWithQueue = () => {
  const { toast } = useToast();
  const {
    executeOperation,
    showQueue,
    operationReady,
    handleOperationReady
  } = useQueuedOperation({
    operationName: 'Operação de Inventário',
    priority: 2,
    showQueueUI: true
  });

  const addInventoryItem = async (itemData: any) => {
    return executeOperation(async () => {
      // Simular operação pesada
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui seria a chamada real para o Supabase
      console.log('Adding inventory item:', itemData);
      
      toast({
        title: 'Item adicionado',
        description: 'Item foi adicionado ao inventário com sucesso.',
      });
      
      return itemData;
    });
  };

  const updateInventoryItem = async (id: string, updateData: any) => {
    return executeOperation(async () => {
      // Simular operação pesada
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui seria a chamada real para o Supabase
      console.log('Updating inventory item:', id, updateData);
      
      toast({
        title: 'Item atualizado',
        description: 'Item foi atualizado com sucesso.',
      });
      
      return { id, ...updateData };
    });
  };

  const deleteInventoryItem = async (id: string) => {
    return executeOperation(async () => {
      // Simular operação pesada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui seria a chamada real para o Supabase
      console.log('Deleting inventory item:', id);
      
      toast({
        title: 'Item removido',
        description: 'Item foi removido do inventário.',
        variant: 'destructive'
      });
      
      return id;
    });
  };

  const QueueComponent = () => (
    <QueueManager
      isVisible={showQueue}
      onOperationReady={handleOperationReady}
    />
  );

  return {
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    QueueComponent,
    showQueue,
    operationReady
  };
};
