import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users,
  Wallet
} from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import LoanStatusChart from "@/components/dashboard/LoanStatusChart";
import StatusSummary from "@/components/dashboard/StatusSummary";
import RecentLoans from "@/components/dashboard/RecentLoans";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import OverdueLoans from "@/components/dashboard/OverdueLoans";
import QuickActions from "@/components/dashboard/QuickActions";
import { useLoan } from "@/context/LoanContext";

export default function Dashboard() {
  const { getDashboardMetrics, loans } = useLoan();
  const metrics = getDashboardMetrics();
  
  // Calculate month-over-month growth
  const activeLoanGrowthLastMonth = 12; // Example value, could be calculated based on historical data
  const interestGrowthLastMonth = 8.5; // Example value, could be calculated based on historical data
  const newOverdueLastMonth = 3; // Example value, could be calculated based on historical data
  const newBorrowersLastMonth = 2; // Example value, could be calculated based on historical data
  
  return (
    <div className="animate-fade-in">
      {/* Título com Gradiente */}
      <h1 className="text-gradient-primary mb-6">Dashboard Financeiro</h1>

      {/* Dashboard Summary Metrics - Com Animações Sequenciais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="animate-slide-up [--animate-delay:100ms]">
          <MetricCard 
            title="Total Emprestado" 
            value={metrics.totalLoaned}
            icon={<DollarSign className="h-6 w-6" />}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
            change={{
              value: `${activeLoanGrowthLastMonth}%`,
              isPositive: true,
              label: "este mês"
            }}
            className="dashboard-card"
          />
        </div>
        
        <div className="animate-slide-up [--animate-delay:150ms]">
          <MetricCard 
            title="Juros Acumulados" 
            value={metrics.totalInterestAccrued}
            icon={<TrendingUp className="h-6 w-6" />}
            iconBgColor="bg-accent/10"
            iconColor="text-accent"
            change={{
              value: `${interestGrowthLastMonth}%`,
              isPositive: true,
              label: "este mês"
            }}
            className="dashboard-card"
          />
        </div>
        
        <div className="animate-slide-up [--animate-delay:200ms]">
          <MetricCard 
            title="Recebido este Mês" 
            value={metrics.totalReceivedThisMonth}
            icon={<Wallet className="h-6 w-6" />}
            iconBgColor="bg-green-100 dark:bg-green-900/20"
            iconColor="text-green-600 dark:text-green-400"
            change={{
              value: "Atual",
              isPositive: true,
              label: "no mês"
            }}
            className="dashboard-card"
          />
        </div>
        
        <div className="animate-slide-up [--animate-delay:250ms]">
          <MetricCard 
            title="Valor em Atraso" 
            value={metrics.totalOverdue}
            icon={<Clock className="h-6 w-6" />}
            iconBgColor="bg-destructive/10"
            iconColor="text-destructive"
            change={{
              value: newOverdueLastMonth.toString(),
              isPositive: false,
              label: "novos este mês"
            }}
            className="dashboard-card"
          />
        </div>
        
        <div className="animate-slide-up [--animate-delay:300ms]">
          <MetricCard 
            title="Total Mutuários" 
            value={metrics.totalBorrowers}
            icon={<Users className="h-6 w-6" />}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/20"
            iconColor="text-indigo-600 dark:text-indigo-400"
            change={{
              value: newBorrowersLastMonth.toString(),
              isPositive: true,
              label: "novos este mês"
            }}
            isCurrency={false}
            className="dashboard-card"
          />
        </div>
      </div>

      {/* Charts Row - Com Cards Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 card-premium p-5 animate-slide-up [--animate-delay:350ms]">
          <h3 className="font-medium mb-3">Composição da Carteira</h3>
          <LoanStatusChart />
        </div>
        <div className="card-premium p-5 animate-slide-up [--animate-delay:400ms]">
          <h3 className="font-medium mb-3">Status dos Empréstimos</h3>
          <StatusSummary />
        </div>
      </div>

      {/* Recent Loans and Upcoming Payments - Com Cards Premium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="animate-slide-up [--animate-delay:450ms]">
          <RecentLoans />
        </div>
        <div className="animate-slide-up [--animate-delay:500ms]">
          <UpcomingPayments />
        </div>
      </div>

      {/* Overdue Loans Section */}
      <div className="mb-8 animate-slide-up [--animate-delay:550ms]">
        <OverdueLoans />
      </div>

      {/* Quick Actions Section */}
      <div className="mt-6 glass-effect p-6 rounded-xl animate-slide-up [--animate-delay:600ms]">
        <h3 className="text-xl font-medium mb-4">Ações Rápidas</h3>
        <QuickActions />
      </div>
    </div>
  );
}
