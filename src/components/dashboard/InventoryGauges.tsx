
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import GaugeChart from "@/components/ui/GaugeChart";
import { useInventoryPercent } from "@/hooks/useDashboardData";

const InventoryGauges: React.FC = () => {
  const { data: inventoryData, isLoading } = useInventoryPercent();

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <h1 className="px-6 pt-6 text-xl sm:text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Estoque Geral
      </h1>
      <p className="px-6 py-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
        Itens disponíveis no estoque
      </p>
      <CardContent className="grid grid-cols-2 gap-4 md:gap-6 my-0 md:my-3 mt-2 md:mt-0">
        {inventoryData?.map((item) => (
          <div key={item.name}>
            <div className="block sm:inline lg:hidden">
              <div className="flex flex-col justify-center items-center md:my-0 p-4 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={150}
                />
              </div>
            </div>
            <div className="hidden lg:inline xl:hidden">
              <div className="flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={170}
                />
              </div>
            </div>
            <div className="hidden xl:inline">
              <div className="flex flex-col justify-center items-center my-4 md:my-0 px-2 py-6 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={180}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InventoryGauges;
