import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { initTheme } from "@/lib/theme";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import HomePage from "./pages/HomePage";
import BabyTracker from "./pages/BabyTracker";
import AskDoula from "./pages/AskDoula";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Courses from "./pages/Courses";
import Learn from "./pages/Learn";
import Shop from "./pages/Shop";
import CantSleep from "./pages/CantSleep";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import PremiumSuccess from "./pages/PremiumSuccess";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Cart from "./pages/Cart";
import BellyBreathe from "./pages/BellyBreathe";
import FeedingTracker from "./pages/FeedingTracker";
import Journey from "./pages/Journey";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";
import { SavedRecipesProvider } from "./contexts/SavedRecipesContext";
import { CartProvider } from "./contexts/CartContext";
import { PostSheetProvider } from "./components/PostSheet";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPremium from "./pages/admin/AdminPremium";
import AdminChats from "./pages/admin/AdminChats";
import AdminAI from "./pages/admin/AdminAI";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [showLogo, setShowLogo] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 400);
    const t2 = setTimeout(() => onDoneRef.current(), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #150A1F 0%, #0d0713 100%)" }}>
      <div
        style={{
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 400ms ease, transform 400ms ease",
        }}
        className="text-center"
      >
        <h1 className="gh-brand" style={{ fontSize: 34 }}>
          belly
        </h1>
        <p className="gh-brand-tag" style={{ marginTop: 6, textAlign: "center" }}>
          Virtual Doula
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth();
  const Spinner = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );
  if (loading) return Spinner;
  if (!session) return <Navigate to="/auth" replace />;
  if (!profile) return Spinner;
  if (!profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

// overflow: clip (not hidden) — hidden boxes are programmatically scrollable, so
// mobile browsers scroll them when focusing an input and the content gets stuck
// off-screen; clip clips identically but can never scroll.
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-layout" style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", position: "relative", overflow: "clip", background: "linear-gradient(180deg, var(--night) 0%, #0d0713 100%)" }}>
    {children}
    <BottomNav />
  </div>
);

const FullScreenLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-layout" style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", position: "relative", overflow: "clip", background: "linear-gradient(180deg, var(--night) 0%, #0d0713 100%)" }}>
    {children}
  </div>
);

const AppContent = () => {
  useEffect(() => { initTheme(); }, []);
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
      <Route path="/baby" element={<ProtectedRoute><AppLayout><BabyTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/ask" element={<ProtectedRoute><AppLayout><AskDoula /></AppLayout></ProtectedRoute>} />
      <Route path="/journey" element={<ProtectedRoute><AppLayout><Journey /></AppLayout></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><AppLayout><Shop /></AppLayout></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><AppLayout><Cart /></AppLayout></ProtectedRoute>} />
      <Route path="/me" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><AppLayout><Journal /></AppLayout></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><AppLayout><Learn /></AppLayout></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><AppLayout><Courses /></AppLayout></ProtectedRoute>} />
      <Route path="/cant-sleep" element={<ProtectedRoute><FullScreenLayout><CantSleep /></FullScreenLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><AppLayout><OrderSuccess /></AppLayout></ProtectedRoute>} />
      <Route path="/premium-success" element={<ProtectedRoute><AppLayout><PremiumSuccess /></AppLayout></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><AppLayout><Recipes /></AppLayout></ProtectedRoute>} />
      <Route path="/recipes/:id" element={<ProtectedRoute><FullScreenLayout><RecipeDetail /></FullScreenLayout></ProtectedRoute>} />
      <Route path="/breathe" element={<ProtectedRoute><FullScreenLayout><BellyBreathe /></FullScreenLayout></ProtectedRoute>} />
      <Route path="/feeding" element={<ProtectedRoute><AppLayout><FeedingTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="promo-codes" element={<AdminPromoCodes />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="premium" element={<AdminPremium />} />
        <Route path="chats" element={<AdminChats />} />
        <Route path="ai" element={<AdminAI />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="broadcast" element={<AdminBroadcast />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#FBEEE0",
            color: "#150A1F",
            borderRadius: 30,
            padding: "10px 22px",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            border: "none",
            whiteSpace: "nowrap",
          },
        }}
        offset={90}
      />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <SavedRecipesProvider>
              <PostSheetProvider>
                <AppContent />
              </PostSheetProvider>
            </SavedRecipesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
