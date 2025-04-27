import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Clock } from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { differenceInDays, parseISO } from "date-fns";

export default function UpcomingPayments() {
  const { loans } = useLoan();
  
  // Apenas empréstimos ativos
  const activeLoans = loans.filter(loan => loan.status === 'active');
  
  // Empréstimos com data de próximo pagamento
  const loansWithPayments = activeLoans.filter(loan => 
    loan.paymentSchedule && loan.paymentSchedule.nextPaymentDate
  );
  
  // Ordenar por data de próximo pagamento (do mais próximo para o mais distante)
  const sortedLoans = [...loansWithPayments].sort((a, b) => {
    const dateA = parseISO(a.paymentSchedule!.nextPaymentDate);
    const dateB = parseISO(b.paymentSchedule!.nextPaymentDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Pegar apenas os próximos 5 pagamentos
  const upcomingPayments = sortedLoans.slice(0, 5);
  
  // Data atual para calcular dias até o próximo pagamento
  const today = new Date();
  
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Próximos Pagamentos</CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link href="/payments">
              <CalendarPlus className="h-4 w-4 mr-1" />
              Registrar
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum pagamento agendado</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/loans">
                <CalendarPlus className="h-4 w-4 mr-1" />
                Ver Empréstimos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingPayments.map(loan => {
              const nextPaymentDate = parseISO(loan.paymentSchedule!.nextPaymentDate);
              const daysUntilPayment = differenceInDays(nextPaymentDate, today);
              
              let urgencyColor = "text-slate-700";
              let urgencyBg = "bg-slate-100";
              
              if (daysUntilPayment <= 0) {
                urgencyColor = "text-red-700";
                urgencyBg = "bg-red-100";
              } else if (daysUntilPayment <= 3) {
                urgencyColor = "text-amber-700";
                urgencyBg = "bg-amber-100";
              } else if (daysUntilPayment <= 7) {
                urgencyColor = "text-orange-700";
                urgencyBg = "bg-orange-100";
              } else {
                urgencyColor = "text-green-700";
                urgencyBg = "bg-green-100";
              }
              
              return (
                <div key={loan.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{loan.borrowerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(loan.paymentSchedule!.installmentAmount)} • {formatDate(loan.paymentSchedule!.nextPaymentDate)}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${urgencyBg} ${urgencyColor}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {daysUntilPayment <= 0 
                        ? "Hoje" 
                        : daysUntilPayment === 1 
                          ? "Amanhã"
                          : `${daysUntilPayment} dias`}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button asChild size="sm" variant="ghost">
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