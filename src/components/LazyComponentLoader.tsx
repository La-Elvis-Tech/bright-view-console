
import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyComponentLoaderProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  importFunc, 
  fallback = <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100"></div></div>, 
  ...props 
}) => {
  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyComponentLoader;
