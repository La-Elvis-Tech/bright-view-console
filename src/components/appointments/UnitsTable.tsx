
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { UnitSummary } from '@/types/appointment';

interface UnitsTableProps {
  units: UnitSummary[];
}

const UnitsTable: React.FC<UnitsTableProps> = ({ units }) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="rounded-md border overflow-x-auto dark:border-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] text-xs md:text-sm">Unidade</TableHead>
                <TableHead className="text-center text-xs md:text-sm">Total</TableHead>
                <TableHead className="text-center text-xs md:text-sm">Confirmados</TableHead>
                <TableHead className="text-center text-xs md:text-sm">Agendados</TableHead>
                <TableHead className="text-center text-xs md:text-sm">Concluídos</TableHead>
                <TableHead className="text-center text-xs md:text-sm">Cancelados</TableHead>
                <TableHead className="text-right text-xs md:text-sm">Taxa de Ocupação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => {
                // Count appointment statuses
                const total = unit.appointments.length;
                const confirmed = unit.appointments.filter(a => a.status === 'confirmed').length;
                const scheduled = unit.appointments.filter(a => a.status === 'scheduled').length;
                const completed = unit.appointments.filter(a => a.status === 'completed').length;
                const canceled = unit.appointments.filter(a => a.status === 'canceled').length;
                
                // Calculate occupancy rate - assume max capacity is 30 if not specified
                const maxCapacity = 30; // Default value
                const occupancyRate = Math.round((total / maxCapacity) * 100);
                
                return (
                  <TableRow key={unit.name} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-none">
                    <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">{unit.name}</TableCell>
                    <TableCell className="text-center text-xs md:text-sm py-2 md:py-3">{total}</TableCell>
                    <TableCell className="text-center text-xs md:text-sm py-2 md:py-3">{confirmed}</TableCell>
                    <TableCell className="text-center text-xs md:text-sm py-2 md:py-3">{scheduled}</TableCell>
                    <TableCell className="text-center text-xs md:text-sm py-2 md:py-3">{completed}</TableCell>
                    <TableCell className="text-center text-xs md:text-sm py-2 md:py-3">{canceled}</TableCell>
                    <TableCell className="text-right text-xs md:text-sm py-2 md:py-3">
                      <span
                        className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          occupancyRate > 80
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                            : occupancyRate > 50
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {occupancyRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitsTable;
