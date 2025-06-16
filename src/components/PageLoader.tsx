
import React from 'react';
import { SkeletonDashboard } from '@/components/ui/skeleton-dashboard';

const PageLoader = () => (
  <div className="animate-pulse">
    <SkeletonDashboard />
  </div>
);

export default PageLoader;
