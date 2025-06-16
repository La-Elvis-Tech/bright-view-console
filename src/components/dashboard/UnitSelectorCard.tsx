
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  location: string;
  healthPercent: number;
  status: "excellent" | "good" | "warning" | "critical";
}

const UnitSelectorCard: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  const units: Unit[] = [
    {
      id: "all",
      name: "Todas as Unidades",
      location: "Geral",
      healthPercent: 87,
      status: "good",
    },
    {
      id: "lab1",
      name: "Laboratório Central",
      location: "Ala A",
      healthPercent: 92,
      status: "excellent",
    },
    {
      id: "lab2",
      name: "Lab. Microbiologia",
      location: "Ala B",
      healthPercent: 78,
      status: "warning",
    },
    {
      id: "lab3",
      name: "Lab. Química Clínica",
      location: "Ala C",
      healthPercent: 95,
      status: "excellent",
    },
    {
      id: "clinic1",
      name: "Clínica Norte",
      location: "Sede 2",
      healthPercent: 65,
      status: "critical",
    },
  ];


  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bom";
      case "warning":
        return "Atenção";
      case "critical":
        return "Crítico";
      default:
        return "Normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Building2
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />
          Unidades
        </CardTitle>
      </CardHeader>

      <CardContent className="h-full">
        <div className="space-y-5 h-full flex flex-col">
          

          <div className="space-y-3 flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status por Unidade
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
              {units
                .filter((unit) => unit.id !== "all")
                .map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-br from-indigo-100/50 to-blue-100/50 dark:from-neutral-700/60 dark:to-neutral-800/70 rounded-xl mb-2 last:mb-0 border border-none transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-800/80 to-blue-600/80 rounded-lg text-white shadow-lg">
                        <MapPin size={16} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                          {unit.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {unit.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className=" text-sm font-bold text-indigo-600 dark:text-indigo-300 bg-gradient-to-bl from-neutral-50 to-blue-50 dark:from-neutral-500/40 dark:to-neutral-700/80 px-2 py-1 border-2 border-neutral-200 dark:border-neutral-600/80 rounded-full shadow-md">
                        {unit.healthPercent}%
                      </span>
                      
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitSelectorCard;
