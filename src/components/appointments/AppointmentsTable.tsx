
import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Appointment } from '@/types/appointment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppointmentsTableProps {
  appointments: Appointment[];
  getStatusColor: (status: string) => string;
  onUpdateStatus?: (appointmentId: string, newStatus: string) => void;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ 
  appointments, 
  getStatusColor, 
  onUpdateStatus 
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<string | null>(null);
  const [dialogAction, setDialogAction] = React.useState<'complete' | 'cancel' | null>(null);

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedAppointment && onUpdateStatus) {
      onUpdateStatus(selectedAppointment, newStatus);
    }
    setSelectedAppointment(null);
    setDialogAction(null);
  };

  const canChangeStatus = (status: string) => {
    return status === 'Agendado' || status === 'Confirmado';
  };

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900/50 shadow-sm">
      <ScrollArea className="h-[400px] w-full rounded-lg">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="sticky top-0 bg-neutral-50 dark:bg-neutral-800 z-10 whitespace-nowrap border-b border-neutral-200 dark:border-neutral-700">
              <TableRow>
                <TableHead className="w-[60px] font-semibold text-neutral-700 dark:text-neutral-300">ID</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-neutral-700 dark:text-neutral-300">Paciente</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-neutral-700 dark:text-neutral-300">Tipo</TableHead>
                <TableHead className="w-[90px] font-semibold text-neutral-700 dark:text-neutral-300">Data</TableHead>
                <TableHead className="w-[80px] font-semibold text-neutral-700 dark:text-neutral-300">Horário</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-neutral-700 dark:text-neutral-300">Médico</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-neutral-700 dark:text-neutral-300">Unidade</TableHead>
                <TableHead className="w-[80px] font-semibold text-neutral-700 dark:text-neutral-300">Custo (R$)</TableHead>
                <TableHead className="w-[90px] font-semibold text-neutral-700 dark:text-neutral-300">Status</TableHead>
                <TableHead className="w-[100px] font-semibold text-neutral-700 dark:text-neutral-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                    <TableCell className="font-medium text-xs text-neutral-600 dark:text-neutral-400">{appointment.id}</TableCell>
                    <TableCell className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{appointment.patient}</TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">{appointment.type}</TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">{format(new Date(appointment.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0 text-neutral-500" />
                        {format(new Date(appointment.date), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">{appointment.doctor}</TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-neutral-500" />
                        {appointment.unit}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      {appointment.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)} variant="secondary">
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canChangeStatus(appointment.status) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20"
                            onClick={() => {
                              setSelectedAppointment(appointment.id);
                              setDialogAction('complete');
                            }}
                          >
                            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
                            onClick={() => {
                              setSelectedAppointment(appointment.id);
                              setDialogAction('cancel');
                            }}
                          >
                            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                      <span>Nenhum agendamento encontrado para este período.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Diálogos unificados */}
      <Dialog open={!!dialogAction} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-neutral-100">
              {dialogAction === 'complete' 
                ? "Confirmar Conclusão" 
                : "Confirmar Cancelamento"}
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              {dialogAction === 'complete'
                ? "Tem certeza que deseja marcar este agendamento como concluído?"
                : "Tem certeza que deseja cancelar este agendamento?"}
              <br /><br />
              <strong>Paciente:</strong> {
                appointments.find(a => a.id === selectedAppointment)?.patient
              }<br />
              <strong>Tipo:</strong> {
                appointments.find(a => a.id === selectedAppointment)?.type
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogAction(null)}
              className="border-neutral-200 dark:border-neutral-700"
            >
              {dialogAction === 'complete' ? "Cancelar" : "Voltar"}
            </Button>
            <Button
              onClick={() => handleStatusUpdate(
                dialogAction === 'complete' ? 'Concluído' : 'Cancelado'
              )}
              className={dialogAction === 'complete' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {dialogAction === 'complete' 
                ? "Confirmar Conclusão" 
                : "Cancelar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsTable;
