
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserMinus, AlertTriangle } from 'lucide-react';

interface UserDeactivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  userName: string;
}

const UserDeactivationDialog: React.FC<UserDeactivationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  userName
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirmar Desativação de Usuário
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <p>
                Você está prestes a desativar o usuário:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                <p><strong>Atenção:</strong> Esta ação irá:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Bloquear o acesso do usuário ao sistema</li>
                  <li>Invalidar todas as sessões ativas</li>
                  <li>Manter o histórico de atividades</li>
                </ul>
              </div>
              <p className="text-sm">
                O usuário pode ser reativado posteriormente por um administrador.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Desativar Usuário
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeactivationDialog;
