
import { useState, useCallback } from 'react';
import { useSystemLoad } from './useSystemLoad';

interface UseQueuedOperationOptions {
  operationName?: string;
  priority?: number;
  showQueueUI?: boolean;
}

export const useQueuedOperation = (options: UseQueuedOperationOptions = {}) => {
  const { operationName = 'Operação', priority = 1, showQueueUI = true } = options;
  const [showQueue, setShowQueue] = useState(false);
  const [operationReady, setOperationReady] = useState(false);
  const { executeWithQueue, isOverloaded } = useSystemLoad();

  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (isOverloaded && showQueueUI) {
      setShowQueue(true);
    }

    try {
      const result = await executeWithQueue(operation, operationName, priority);
      setShowQueue(false);
      return result;
    } catch (error) {
      setShowQueue(false);
      throw error;
    }
  }, [executeWithQueue, operationName, priority, isOverloaded, showQueueUI]);

  const handleOperationReady = useCallback(() => {
    setOperationReady(true);
    // Auto-hide queue after a short delay if operation is ready
    setTimeout(() => {
      setShowQueue(false);
      setOperationReady(false);
    }, 2000);
  }, []);

  return {
    executeOperation,
    showQueue,
    operationReady,
    handleOperationReady,
    isOverloaded
  };
};
