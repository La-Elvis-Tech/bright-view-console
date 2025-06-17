
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock } from 'lucide-react';

interface AppointmentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  doctorsCount: number;
  examTypesCount: number;
  children: {
    calendar: React.ReactNode;
    doctors: React.ReactNode;
    examTypes: React.ReactNode;
  };
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  activeTab,
  onTabChange,
  doctorsCount,
  examTypesCount,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <TabsTrigger 
          value="calendar"
          className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendário
        </TabsTrigger>
        <TabsTrigger 
          value="doctors"
          className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
        >
          <Users className="h-4 w-4 mr-2" />
          Médicos ({doctorsCount})
        </TabsTrigger>
        <TabsTrigger 
          value="exam-types"
          className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
        >
          <Clock className="h-4 w-4 mr-2" />
          Tipos de Exames ({examTypesCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calendar">
        {children.calendar}
      </TabsContent>

      <TabsContent value="doctors">
        {children.doctors}
      </TabsContent>

      <TabsContent value="exam-types">
        {children.examTypes}
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentTabs;
