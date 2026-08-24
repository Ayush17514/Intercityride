import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-wayfare-sand">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-wayfare-teal border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (user.role === "driver") return <Navigate to="/dashboard/driver" replace />;
  return <Navigate to="/dashboard/user" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/user" element={<UserDashboard />} />
            <Route path="/dashboard/passenger" element={<UserDashboard />} />
            <Route path="/dashboard/driver" element={<DriverDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
