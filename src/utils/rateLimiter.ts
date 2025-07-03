// Rate Limiter para FASE 2 - API REST robusta
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultLimit: number;
  private windowMs: number;

  constructor(defaultLimit = 100, windowMs = 60000) { // 100 requests per minute
    this.defaultLimit = defaultLimit;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string, limit?: number): boolean {
    const currentTime = Date.now();
    const requestLimit = limit || this.defaultLimit;
    
    const entry = this.limits.get(identifier);
    
    if (!entry || currentTime > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: currentTime + this.windowMs
      });
      return true;
    }
    
    if (entry.count >= requestLimit) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string, limit?: number): number {
    const entry = this.limits.get(identifier);
    const requestLimit = limit || this.defaultLimit;
    
    if (!entry || Date.now() > entry.resetTime) {
      return requestLimit;
    }
    
    return Math.max(0, requestLimit - entry.count);
  }

  getResetTime(identifier: string): number | null {
    const entry = this.limits.get(identifier);
    
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }
    
    return entry.resetTime;
  }

  // Limpar entradas expiradas periodicamente
  cleanup(): void {
    const currentTime = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (currentTime > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter();

// Cleanup automático a cada 5 minutos
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default RateLimiter;