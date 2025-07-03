
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SystemLoadMetrics {
  currentLoad: number;
  activeOperations: number;
  queueSize: number;
  averageResponseTime: number;
}

interface QueueItem {
  id: string;
  operation: () => Promise<any>;
  priority: number;
  timestamp: number;
  userId?: string;
}

// Singleton para gerenciar a fila globalmente
class SystemLoadManager {
  private static instance: SystemLoadManager;
  private metrics: SystemLoadMetrics = {
    currentLoad: 0,
    activeOperations: 0,
    queueSize: 0,
    averageResponseTime: 0
  };
  private queue: QueueItem[] = [];
  private activeOperations = new Set<string>();
  private maxConcurrentOperations = 5;
  private loadThreshold = 0.7; // 70% de carga para ativar fila
  private responseTimes: number[] = [];
  private listeners = new Set<(metrics: SystemLoadMetrics) => void>();

  static getInstance() {
    if (!SystemLoadManager.instance) {
      SystemLoadManager.instance = new SystemLoadManager();
    }
    return SystemLoadManager.instance;
  }

  subscribe(callback: (metrics: SystemLoadMetrics) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.metrics));
  }

  private updateMetrics() {
    this.metrics = {
      currentLoad: this.activeOperations.size / this.maxConcurrentOperations,
      activeOperations: this.activeOperations.size,
      queueSize: this.queue.length,
      averageResponseTime: this.responseTimes.length > 0 
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
        : 0
    };
    this.notifyListeners();
  }

  isOverloaded(): boolean {
    return this.metrics.currentLoad >= this.loadThreshold || this.queue.length > 0;
  }

  async executeOperation<T>(
    operation: () => Promise<T>,
    priority: number = 1,
    userId?: string
  ): Promise<T> {
    const operationId = `${Date.now()}-${Math.random()}`;
    
    // Se não está sobrecarregado, executa diretamente
    if (!this.isOverloaded() && this.activeOperations.size < this.maxConcurrentOperations) {
      return this.runOperation(operationId, operation);
    }

    // Adiciona à fila
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        id: operationId,
        operation: async () => {
          try {
            const result = await this.runOperation(operationId, operation);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        priority,
        timestamp: Date.now(),
        userId
      };

      this.queue.push(queueItem);
      this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
      this.updateMetrics();
      this.processQueue();
    });
  }

  private async runOperation<T>(id: string, operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.activeOperations.add(id);
    this.updateMetrics();

    try {
      const result = await operation();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Manter apenas os últimos 10 tempos de resposta
      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 10) {
        this.responseTimes.shift();
      }

      return result;
    } finally {
      this.activeOperations.delete(id);
      this.updateMetrics();
      setTimeout(() => this.processQueue(), 100); // Small delay before processing next
    }
  }

  private processQueue() {
    if (this.queue.length === 0 || this.activeOperations.size >= this.maxConcurrentOperations) {
      return;
    }

    const nextItem = this.queue.shift();
    if (nextItem) {
      nextItem.operation();
      this.updateMetrics();
    }
  }

  getQueuePosition(userId?: string): number {
    return this.queue.findIndex(item => item.userId === userId) + 1;
  }
}

export const useSystemLoad = (userId?: string) => {
  const [metrics, setMetrics] = useState<SystemLoadMetrics>({
    currentLoad: 0,
    activeOperations: 0,
    queueSize: 0,
    averageResponseTime: 0
  });
  const [queuePosition, setQueuePosition] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const manager = SystemLoadManager.getInstance();
    const unsubscribe = manager.subscribe(setMetrics);

    const interval = setInterval(() => {
      const position = manager.getQueuePosition(userId);
      setQueuePosition(position);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId]);

  const executeWithQueue = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operação',
    priority: number = 1
  ): Promise<T> => {
    const manager = SystemLoadManager.getInstance();
    
    if (manager.isOverloaded()) {
      toast({
        title: 'Sistema em alta demanda',
        description: `${operationName} foi adicionada à fila. Você pode jogar enquanto espera!`,
        duration: 3000,
      });
    }

    return manager.executeOperation(operation, priority, userId);
  }, [userId, toast]);

  return {
    metrics,
    queuePosition,
    isOverloaded: metrics.currentLoad >= 0.7 || metrics.queueSize > 0,
    executeWithQueue
  };
};
