
export interface AuthLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  action: string;
  details: any;
  userEmail?: string;
  error?: string;
}

class AuthLogger {
  private logs: AuthLogEntry[] = [];
  private maxLogs = 100;

  private log(level: AuthLogEntry['level'], action: string, details: any = {}, error?: string) {
    const entry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      userEmail: details.email || details.userEmail,
      error
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console for debugging
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[AUTH ${level.toUpperCase()}] ${action}:`, details, error || '');
  }

  info(action: string, details: any = {}) {
    this.log('info', action, details);
  }

  warning(action: string, details: any = {}) {
    this.log('warning', action, details);
  }

  error(action: string, details: any = {}, error?: string) {
    this.log('error', action, details, error);
  }

  debug(action: string, details: any = {}) {
    this.log('debug', action, details);
  }

  getLogs(): AuthLogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const authLogger = new AuthLogger();
