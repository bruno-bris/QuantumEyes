import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import CyberAssessment from "@/pages/cyber-assessment";
import Protection from "@/pages/protection";
import Continuity from "@/pages/continuity";
import Reports from "@/pages/reports";
import ReportDetail from "@/pages/report-detail";
import Settings from "@/pages/settings";
import QuantumAnalysis from "@/pages/quantum-analysis";
import QuantumVisualizer from "@/pages/quantum-visualizer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/assessment" component={CyberAssessment} />
        <Route path="/protection" component={Protection} />
        <Route path="/continuity" component={Continuity} />
        <Route path="/quantum" component={QuantumAnalysis} />
        <Route path="/quantum-visualizer" component={QuantumVisualizer} />
        <Route path="/reports" component={Reports} />
        <Route path="/report-detail/:id" component={ReportDetail} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
