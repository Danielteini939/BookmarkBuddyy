import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoanProvider } from "@/context/LoanContext";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LoansPage from "@/pages/LoansPage";
import LoanDetailPage from "@/pages/LoanDetailPage";
import LoanFormPage from "@/pages/LoanFormPage";
import BorrowersPage from "@/pages/BorrowersPage";
import BorrowerFormPage from "@/pages/BorrowerFormPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        
        {/* Loans Routes */}
        <Route path="/loans" component={LoansPage} />
        <Route path="/loans/new" component={LoanFormPage} />
        <Route path="/loans/:id/edit" component={LoanFormPage} />
        <Route path="/loans/:id" component={LoanDetailPage} />
        
        {/* Borrowers Routes */}
        <Route path="/borrowers" component={BorrowersPage} />
        <Route path="/borrowers/new" component={BorrowerFormPage} />
        <Route path="/borrowers/:id" component={BorrowerFormPage} />
        
        {/* Other Routes */}
        <Route path="/payments" component={PaymentsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoanProvider>
          <Toaster />
          <Router />
        </LoanProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
