import { Card } from "@/components/ui/card";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency } from "@/utils/formatters";

export default function Dashboard() {
  const { 
    loans, 
    borrowers, 
    payments, 
    getDashboardMetrics 
  } = useLoan();
  
  const metrics = getDashboardMetrics();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Emprestado</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalLoaned)}</p>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Juros Acumulados</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalInterestAccrued)}</p>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total em Atraso</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalOverdue)}</p>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total de Mutuários</h3>
          <p className="text-2xl font-bold mt-1">{metrics.totalBorrowers}</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Status dos Empréstimos</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ativos</span>
              <span className="font-medium">{metrics.activeLoanCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagos</span>
              <span className="font-medium">{metrics.paidLoanCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Em Atraso</span>
              <span className="font-medium">{metrics.overdueLoanCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Inadimplentes</span>
              <span className="font-medium">{metrics.defaultedLoanCount}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Estatísticas Gerais</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total de Empréstimos</span>
              <span className="font-medium">{loans.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total de Pagamentos</span>
              <span className="font-medium">{payments.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Média por Empréstimo</span>
              <span className="font-medium">
                {loans.length > 0 
                  ? formatCurrency(metrics.totalLoaned / loans.length) 
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Recebido Este Mês</span>
              <span className="font-medium">{formatCurrency(metrics.totalReceivedThisMonth)}</span>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-4 shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Empréstimos Recentes</h3>
        {loans.length === 0 ? (
          <p className="text-gray-500">Nenhum empréstimo cadastrado</p>
        ) : (
          <div className="space-y-2">
            {loans.slice(0, 5).map(loan => (
              <div key={loan.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{loan.borrowerName}</span>
                  <span>{formatCurrency(loan.principal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Status: {loan.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
