import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarPlus } from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { differenceInDays, parseISO } from "date-fns";

export default function OverdueLoans() {
  const { loans } = useLoan();
  
  // Pegar empréstimos em atraso
  const overdueLoans = loans.filter(loan => loan.status === 'overdue');
  
  // Ordenar por duração do atraso (do mais antigo para o mais recente)
  const sortedLoans = [...overdueLoans].sort((a, b) => {
    const dateA = parseISO(a.dueDate);
    const dateB = parseISO(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Data atual para calcular dias em atraso
  const today = new Date();
  
  return (
    <Card className="card-premium border-red-200 dark:border-red-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Empréstimos em Atraso
          </CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link href="/loans">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Ver Todos
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {overdueLoans.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhum empréstimo em atraso</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedLoans.map(loan => {
              const dueDate = parseISO(loan.dueDate);
              const daysOverdue = Math.abs(differenceInDays(dueDate, today));
              
              let overdueSeverity = "";
              
              if (daysOverdue > 90) {
                overdueSeverity = "bg-red-700 text-white";
              } else if (daysOverdue > 30) {
                overdueSeverity = "bg-red-600 text-white";
              } else if (daysOverdue > 15) {
                overdueSeverity = "bg-red-500 text-white";
              } else {
                overdueSeverity = "bg-red-400 text-white";
              }
              
              return (
                <div key={loan.id} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{loan.borrowerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(loan.principal)} • Vencido em {formatDate(loan.dueDate)}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${overdueSeverity}`}>
                      {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} em atraso
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button asChild size="sm" variant="outline" className="border-red-200 hover:border-red-300 mr-2">
                      <Link href={`/loans/${loan.id}`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Detalhes
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="default" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                      <Link href={`/loans/${loan.id}`}>
                        <CalendarPlus className="h-3 w-3 mr-1" />
                        Registrar Pagamento
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}