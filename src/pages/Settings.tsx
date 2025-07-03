
import LaboratoryProfile from "@/components/settings/LaboratoryProfile";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import UnitsManagement from "@/components/settings/UnitsManagement";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { SkeletonSettings } from "@/components/ui/skeleton-settings";
import { gsap } from "gsap";
import { Calendar, Settings as SettingsIcon, User, LogOut, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Settings = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const { signOut, user, isAdmin } = useAuthContext();

  // Show loading skeleton while checking auth
  if (!user) {
    return <SkeletonSettings />;
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen ">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg">
                <SettingsIcon className="h-5 w-5 text-neutral-500" />
              </div>
              Configurações
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Ajuste as configurações do sistema e personalize sua experiência
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm rounded-lg p-1 border-0 shadow-sm">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm border-0 shadow-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair da conta</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm border-0 shadow-sm mb-6 ${isAdmin() ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
            >
              <User className="hidden xl:block h-4 w-4" /> 
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
            >
              <Calendar className="hidden xl:block h-4 w-4" /> 
              Notificações
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger
                value="units"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
              >
                <Building2 className="hidden xl:block h-4 w-4" /> 
                Unidades
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60"
            >
              <SettingsIcon className="hidden xl:block h-4 w-4" /> 
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <LaboratoryProfile />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings />
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="units" className="mt-0">
              <UnitsManagement />
            </TabsContent>
          )}

          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
