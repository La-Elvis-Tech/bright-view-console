
import { useState } from "react";

export interface ServiceLog {
  id: string;
  type: string;
  action: string;
  item: string;
  details: string;
  user: string;
  timestamp: Date;
  module: string;
}

let logCounter = 1000;

export const useServiceLogs = () => {
  const [logs, setLogs] = useState<ServiceLog[]>([]);

  const addLog = (log: Omit<ServiceLog, 'id' | 'timestamp'>) => {
    const newLog: ServiceLog = {
      ...log,
      id: `L${logCounter++}`,
      timestamp: new Date()
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs]);
    
    // Em um app real, isso seria enviado para o backend
    console.log("Log adicionado:", newLog);
    
    return newLog;
  };

  const getLogs = () => logs;

  const getLogsByModule = (module: string) => 
    logs.filter(log => log.module === module);

  const getLogsByUser = (user: string) => 
    logs.filter(log => log.user === user);

  return {
    addLog,
    getLogs,
    getLogsByModule,
    getLogsByUser,
    logs
  };
};
