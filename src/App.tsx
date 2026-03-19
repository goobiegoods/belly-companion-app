import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import HomePage from "./pages/HomePage";
import BabyTracker from "./pages/BabyTracker";
import AskDoula from "./pages/AskDoula";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Courses from "./pages/Courses";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-belly-bg flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-belly-hero border-t-transparent animate-spin" /></div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (!profile?.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-lg mx-auto relative">
    {children}
    <BottomNav />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" toastOptions={{ className: "bg-belly-upsell-bg border-belly-upsell-border text-foreground" }} />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
            <Route path="/baby" element={<ProtectedRoute><AppLayout><BabyTracker /></AppLayout></ProtectedRoute>} />
            <Route path="/ask" element={<ProtectedRoute><AskDoula /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
            <Route path="/me" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><AppLayout><Journal /></AppLayout></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><AppLayout><Courses /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
