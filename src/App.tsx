
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <DashboardSidebar />
            <main className="flex-1 overflow-hidden">
              <div className="border-b p-4">
                <SidebarTrigger />
              </div>
              <div className="p-6">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/analytics" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Analytics Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  <Route path="/users" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Users Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  <Route path="/inventory" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Inventory Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  <Route path="/reports" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Reports Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  <Route path="/calendar" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Calendar Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  <Route path="/settings" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
