import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Profile from "@/pages/Profile";
import Payments from "@/pages/Payments";
import Wallet from "@/pages/Wallet";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/AppLayout";

// Initial loading screen
function InitialLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <Skeleton className="h-12 w-12 rounded-full mr-3" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <InitialLoading />;
  }

  const isAuthPage = location === "/login" || location === "/register" || location === "/";

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        {/* Redirect root to login */}
        {() => {
          window.location.href = "/login";
          return null;
        }}
      </Route>
      
      {/* Protected routes with AppLayout */}
      <Route path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      
      <Route path="/transactions">
        <AppLayout>
          <Transactions />
        </AppLayout>
      </Route>
      
      <Route path="/payments">
        <AppLayout>
          <Payments />
        </AppLayout>
      </Route>
      
      <Route path="/wallet">
        <AppLayout>
          <Wallet />
        </AppLayout>
      </Route>
      
      <Route path="/profile">
        <AppLayout>
          <Profile />
        </AppLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <Router />
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
