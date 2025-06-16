
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./hooks/use-theme";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Requests = lazy(() => import("./pages/Requests"));
const Orders = lazy(() => import("./pages/Orders"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Simulations = lazy(() => import("./pages/Simulations"));
const Users = lazy(() => import("./pages/Users"));
const InviteCodes = lazy(() => import("./pages/InviteCodes"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const PageFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">Carregando página...</p>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={
                <Suspense fallback={<PageFallback />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<PageFallback />}>
                  <ResetPassword />
                </Suspense>
              } />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <Suspense fallback={<PageFallback />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/inventory" element={
                    <Suspense fallback={<PageFallback />}>
                      <Inventory />
                    </Suspense>
                  } />
                  <Route path="/requests" element={
                    <Suspense fallback={<PageFallback />}>
                      <Requests />
                    </Suspense>
                  } />
                  <Route path="/orders" element={
                    <Suspense fallback={<PageFallback />}>
                      <Orders />
                    </Suspense>
                  } />
                  <Route path="/alerts" element={
                    <Suspense fallback={<PageFallback />}>
                      <Alerts />
                    </Suspense>
                  } />
                  <Route path="/simulations" element={
                    <Suspense fallback={<PageFallback />}>
                      <Simulations />
                    </Suspense>
                  } />
                  <Route path="/reports" element={
                    <Suspense fallback={<PageFallback />}>
                      <Reports />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<PageFallback />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="/users" element={
                    <Suspense fallback={<PageFallback />}>
                      <Users />
                    </Suspense>
                  } />
                  <Route path="/invite-codes" element={
                    <Suspense fallback={<PageFallback />}>
                      <InviteCodes />
                    </Suspense>
                  } />
                  <Route path="*" element={
                    <Suspense fallback={<PageFallback />}>
                      <NotFound />
                    </Suspense>
                  } />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
