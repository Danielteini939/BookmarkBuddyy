import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoanProvider } from "@/context/LoanContext";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/dashboard";
import LoanList from "@/pages/loans";
import NewLoan from "@/pages/loans/new";
import LoanDetails from "@/pages/loans/[id]";
import EditLoan from "@/pages/loans/[id]/edit";
import BorrowerList from "@/pages/borrowers";
import NewBorrower from "@/pages/borrowers/new";
import BorrowerDetails from "@/pages/borrowers/[id]";
import PaymentList from "@/pages/payments";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/loans" component={LoanList} />
        <Route path="/loans/new" component={NewLoan} />
        <Route path="/loans/:id" component={LoanDetails} />
        <Route path="/loans/:id/edit" component={EditLoan} />
        <Route path="/borrowers" component={BorrowerList} />
        <Route path="/borrowers/new" component={NewBorrower} />
        <Route path="/borrowers/:id" component={BorrowerDetails} />
        <Route path="/payments" component={PaymentList} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoanProvider>
          <Router />
        </LoanProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
