import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

type LoaderConfig = {
  paths?: string[]; // Rotas específicas que disparam o loader
  delay?: number;   // Atraso mínimo para exibição
  timeout?: number; // Tempo máximo de exibição
};

export const PageLoaderLogin = ({
  paths = [],
  delay = 300,
  timeout = 500
}: LoaderConfig) => {
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const loc = useLocation();
  const prevLocation = useRef(loc);
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null);

  // Verifica se a rota requer loader
  const shouldLoad = (path: string) => {
    if (paths.length === 0) return true; // Ativa para todas rotas
    return paths.some(p => path.startsWith(p));
  };

  useEffect(() => {
    const currentPath = loc.pathname;
    const prevPath = prevLocation.current.pathname;
    
    // Só ativa se a rota atual estiver na lista ou lista vazia
    if (shouldLoad(currentPath)) {
      const start = () => {
        setIsExiting(false);
        setLoading(true);
        loaderTimeout.current = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => setLoading(false), delay);
        }, delay);
      };

      // Força término do loader anterior
      if (loaderTimeout.current) {
        clearTimeout(loaderTimeout.current);
        setLoading(false);
        setIsExiting(false);
      }

      start();
    }

    prevLocation.current = loc;

    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
    };
  }, [loc, delay, timeout]);


  if (!loading) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20 backdrop-blur-[2px]
      ${isExiting ? 'opacity-0' : 'opacity-100'} transition-all duration-300`}>
      
      <div className={`relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl
        ${isExiting ? 'scale-90 translate-y-4' : 'scale-100 translate-y-0'} 
        transition-transform duration-300 ease-out`}>
        
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 border-4 border-sky-400/30 rounded-full 
            animate-spin border-t-blue-400"></div>
          
          <div className="flex flex-col">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Carregando
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Por favor, aguarde...
            </span>
          </div>
        </div>

        <div className="absolute mx-2 bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden">
          <div className="w-1/2 h-full bg-blue-400 animate-progress rounded-b-2xl"></div>
        </div>
      </div>
    </div>
  );
};