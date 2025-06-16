
import React from 'react';

const SimpleLoader = () => (
  <div className="flex items-center justify-center h-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
  </div>
);

export default React.memo(SimpleLoader);
