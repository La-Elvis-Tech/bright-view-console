
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { PendingApprovalMessage } from "./auth/PendingApprovalMessage";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, profile, user, signOut } = useAuthContext();
  const location = useLocation();

  console.log('ProtectedRoute check:', { isAuthenticated, loading, profile: profile?.status });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-blue mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se o usuário está autenticado mas com status pendente, mostrar tela de aguardo
  if (profile && profile.status === 'pending') {
    return (
      <PendingApprovalMessage 
        userEmail={user?.email} 
        onSignOut={signOut}
      />
    );
  }

  // Se o usuário está suspenso, redirecionar para auth
  if (profile && profile.status === 'suspended') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Só permite acesso se o status for 'active'
  if (profile && profile.status !== 'active') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
