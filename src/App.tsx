
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/use-theme';
import { AuthProvider } from '@/context/AuthContext';
import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Requests from '@/pages/Requests';
import Inventory from '@/pages/Inventory';
import Simulations from '@/pages/Simulations';
import Alerts from '@/pages/Alerts';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import { Login } from '@/pages/Login';
import ResetPassword from '@/pages/ResetPassword';
import InviteCodes from '@/pages/InviteCodes';
import ExamTypes from '@/pages/ExamTypes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SupabaseAuthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/requests" element={<Requests />} />
                          <Route path="/exam-types" element={<ExamTypes />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/simulations" element={<Simulations />} />
                          <Route path="/alerts" element={<Alerts />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/invite-codes" element={<InviteCodes />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </SupabaseAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
