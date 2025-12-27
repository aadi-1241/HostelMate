import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/dashboard";
import HostelsPage from "@/pages/hostels";
import InventoryPage from "@/pages/inventory";
import StudentsPage from "@/pages/students";
import AllocationsPage from "@/pages/allocations";
import TariffsPage from "@/pages/tariffs";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import LoginPlaceholder from "@/pages/login-placeholder";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPlaceholder />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/hostels" component={HostelsPage} />
      <Route path="/inventory" component={InventoryPage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/allocations" component={AllocationsPage} />
      <Route path="/tariffs" component={TariffsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
