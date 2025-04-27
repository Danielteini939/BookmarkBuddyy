import { useLoan } from "@/context/LoanContext";
import { getStatusColor, getStatusName } from "@/utils/formatters";
import { LoanStatus } from "@/types";

export default function StatusSummary() {
  const { getDashboardMetrics } = useLoan();
  const metrics = getDashboardMetrics();
  
  // Array com todos os status possíveis
  const allStatuses: LoanStatus[] = ['active', 'paid', 'overdue', 'defaulted'];
  
  // Obter contagem de cada status
  const statusCounts = {
    active: metrics.activeLoanCount,
    paid: metrics.paidLoanCount,
    overdue: metrics.overdueLoanCount,
    defaulted: metrics.defaultedLoanCount
  };
  
  // Total de empréstimos
  const totalLoans = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  
  // Se não houver empréstimos, mostrar mensagem
  if (totalLoans === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Nenhum empréstimo cadastrado
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Resumo com números */}
      <div className="grid grid-cols-2 gap-4">
        {allStatuses.map(status => {
          const count = statusCounts[status];
          const percentage = totalLoans ? Math.round((count / totalLoans) * 100) : 0;
          const { bgColor, textColor } = getStatusColor(status);
          
          return (
            <div key={status} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${textColor}`}>{getStatusName(status)}</span>
                <span className={`text-xs ${textColor} px-2 py-1 rounded-full ${bgColor}`}>
                  {percentage}%
                </span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}