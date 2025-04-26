import React from "react";
import { Link } from "wouter";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { UpcomingPayment } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface UpcomingDueLoansProps {
  upcomingPayments: UpcomingPayment[];
  onRegisterPayment: (loanId: number) => void;
}

const UpcomingDueLoans: React.FC<UpcomingDueLoansProps> = ({
  upcomingPayments,
  onRegisterPayment,
}) => {
  return (
    <Card className="border border-slate-200">
      <CardHeader className="p-5 border-b border-slate-200 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Próximos Vencimentos
        </CardTitle>
        {upcomingPayments.length > 0 && (
          <Button variant="link" asChild className="text-emerald-600 hover:text-emerald-700 h-auto p-0">
            <Link href="/loans">Ver todos</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <ScrollArea className="h-80 pr-4">
          {upcomingPayments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {payment.borrowerName}
                    </p>
                    <div className="text-sm text-slate-500 flex items-center mt-1">
                      <span className="mr-3">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(payment.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      {payment.daysUntilDue} {payment.daysUntilDue === 1 ? "dia" : "dias"}
                    </Badge>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-xs text-emerald-600 hover:text-emerald-700"
                      onClick={() => onRegisterPayment(payment.loanId)}
                    >
                      Registrar Pagamento
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <CalendarIcon className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-slate-500">
                Não há pagamentos próximos do vencimento.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UpcomingDueLoans;
