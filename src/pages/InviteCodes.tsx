
import React from 'react';
import InviteCodeDisplay from '@/components/InviteCodeDisplay';
import { SkeletonInviteCodes } from '@/components/ui/skeleton-invite-codes';
import { useAuthContext } from '@/context/AuthContext';

const InviteCodes = () => {
  const { user } = useAuthContext();

  // Show loading skeleton while checking auth
  if (!user) {
    return <SkeletonInviteCodes />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sistema de Cadastro
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Informações sobre o novo sistema de aprovação manual
        </p>
      </div>
      
      <InviteCodeDisplay />
    </div>
  );
};

export default InviteCodes;
