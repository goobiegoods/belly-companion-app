import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import HomePage from "./pages/HomePage";
import BabyTracker from "./pages/BabyTracker";
import AskDoula from "./pages/AskDoula";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Courses from "./pages/Courses";
import Shop from "./pages/Shop";
import CantSleep from "./pages/CantSleep";
import Orders from "./pages/Orders";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";
import { SavedRecipesProvider } from "./contexts/SavedRecipesContext";

const queryClient = new QueryClient();

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 400);
    const t2 = setTimeout(() => onDone(), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style={{ background: "#FEF8F4" }}>
      <div
        style={{
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 400ms ease, transform 400ms ease",
        }}
        className="text-center"
      >
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.5px]" style={{ color: "#C85828" }}>
          BELLY
        </h1>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4, color: "#C4906A" }}>
          Virtual Doula
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FF7840", borderTopColor: "transparent" }} /></div>;
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

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("belly-splash-shown"));

  if (showSplash) {
    return (
      <SplashScreen
        onDone={() => {
          sessionStorage.setItem("belly-splash-shown", "1");
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
      <Route path="/baby" element={<ProtectedRoute><AppLayout><BabyTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/ask" element={<ProtectedRoute><AskDoula /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><AppLayout><Shop /></AppLayout></ProtectedRoute>} />
      <Route path="/me" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><AppLayout><Journal /></AppLayout></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><AppLayout><Courses /></AppLayout></ProtectedRoute>} />
      <Route path="/cant-sleep" element={<ProtectedRoute><CantSleep /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><AppLayout><Recipes /></AppLayout></ProtectedRoute>} />
      <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" toastOptions={{ className: "belly-glass" }} />
      <BrowserRouter>
        <AuthProvider>
          <SavedRecipesProvider>
            <AppContent />
          </SavedRecipesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
