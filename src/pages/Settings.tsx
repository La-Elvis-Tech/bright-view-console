
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
    <div ref={pageRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Configurações
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Ajuste as configurações do sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block bg-neutral-100 rounded-lg dark:bg-neutral-800 p-1">
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair da conta</span>
          </Button>
        </div>
      </div>

      <div className="">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid mb-8 py-0 bg-neutral-200/70 dark:bg-neutral-800/30 shadow-sm border border-none ${isAdmin() ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">
              <User className="hidden xl:block h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
            >
              <Calendar className="hidden xl:block h-4 w-4" /> Notificações
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger
                value="units"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
              >
                <Building2 className="hidden xl:block h-4 w-4" /> Unidades
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">
              <SettingsIcon className="hidden xl:block h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <div className="p-2">
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
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
