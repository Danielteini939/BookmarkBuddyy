import { Card, CardContent } from "@/components/ui/card";
import { useLoan } from "@/context/LoanContext";
import { LoanType } from "@/types";

export default function LoanStatusChart() {
  const { loans } = useLoan();
  
  // Contagem de empréstimos por status
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const paidLoans = loans.filter(loan => loan.status === 'paid').length;
  const overdueLoans = loans.filter(loan => loan.status === 'overdue').length;
  const defaultedLoans = loans.filter(loan => loan.status === 'defaulted').length;
  
  // Total para cálculo de porcentagens
  const totalLoans = loans.length;
  
  // Função auxiliar para calcular a porcentagem
  const getPercentage = (count: number) => {
    if (totalLoans === 0) return 0;
    return Math.round((count / totalLoans) * 100);
  };
  
  // Dados para o gráfico
  const statusData = [
    { label: 'Ativos', count: activeLoans, color: 'bg-[hsl(175,80%,35%)]', percentage: getPercentage(activeLoans) },
    { label: 'Pagos', count: paidLoans, color: 'bg-[hsl(165,75%,42%)]', percentage: getPercentage(paidLoans) },
    { label: 'Em Atraso', count: overdueLoans, color: 'bg-[hsl(350,60%,50%)]', percentage: getPercentage(overdueLoans) },
    { label: 'Inadimplentes', count: defaultedLoans, color: 'bg-[hsl(0,70%,50%)]', percentage: getPercentage(defaultedLoans) }
  ];
  
  return (
    <div>
      {totalLoans === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Nenhum empréstimo cadastrado
        </div>
      ) : (
        <div className="space-y-4">
          {/* Barras de porcentagem */}
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
            {statusData.map((status, index) => (
              <div 
                key={index} 
                className={`${status.color} h-full transition-all duration-500 ease-in-out`}
                style={{ width: `${status.percentage}%` }}
                title={`${status.label}: ${status.percentage}%`}
              />
            ))}
          </div>
          
          {/* Legenda */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${status.color} mr-2`} />
                <span className="text-sm">{status.label}: {status.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}