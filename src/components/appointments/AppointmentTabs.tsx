
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
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-neutral-200/40 dark:border-neutral-800/40 h-11 p-1">
        <TabsTrigger 
          value="calendar"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium px-4 py-2"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendário
        </TabsTrigger>
        <TabsTrigger 
          value="doctors"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium px-4 py-2"
        >
          <Users className="h-4 w-4 mr-2" />
          Médicos
          <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
            {doctorsCount}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="exam-types"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-sm font-medium px-4 py-2"
        >
          <Clock className="h-4 w-4 mr-2" />
          Exames
          <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
            {examTypesCount}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="mt-6">
        {children.calendar}
      </TabsContent>

      <TabsContent value="doctors" className="mt-6">
        {children.doctors}
      </TabsContent>

      <TabsContent value="exam-types" className="mt-6">
        {children.examTypes}
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentTabs;
