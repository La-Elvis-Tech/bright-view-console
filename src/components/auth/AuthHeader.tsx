
import React from 'react';

export const AuthHeader: React.FC = () => {
  return (
    <div className="text-center mb-8 h-32">
      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-2">
        <img 
          src="/logolaelvis.svg" 
          alt="La Elvis Tech" 
          className="w-full h-full object-contain grayscale brightness-0 invert"
        />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-600 bg-clip-text text-transparent mb-2">
        La Elvis Tech
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400">Gestão laboratorial inteligente</p>
    </div>
  );
};
