import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export default function RecentLoans() {
  const { loans, borrowers } = useLoan();
  
  // Ordenar empréstimos do mais recente para o mais antigo (baseado na data de emissão)
  const sortedLoans = [...loans].sort((a, b) => {
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });
  
  // Pegar apenas os 5 mais recentes
  const recentLoans = sortedLoans.slice(0, 5);
  
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Empréstimos Recentes</CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link href="/loans">
              <Eye className="h-4 w-4 mr-1" />
              Ver todos
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentLoans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum empréstimo cadastrado</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/loans/new">
                <Plus className="h-4 w-4 mr-1" />
                Novo Empréstimo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentLoans.map(loan => {
              let statusColor = "bg-slate-100 text-slate-700";
              
              switch(loan.status) {
                case 'active':
                  statusColor = "bg-green-100 text-green-700";
                  break;
                case 'paid':
                  statusColor = "bg-blue-100 text-blue-700";
                  break;
                case 'overdue':
                  statusColor = "bg-amber-100 text-amber-700";
                  break;
                case 'defaulted':
                  statusColor = "bg-red-100 text-red-700";
                  break;
              }
              
              return (
                <div key={loan.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{loan.borrowerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(loan.principal)} • {formatDate(loan.issueDate)}
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor)}>
                      {loan.status === 'active' ? 'Ativo' : 
                       loan.status === 'paid' ? 'Pago' :
                       loan.status === 'overdue' ? 'Em Atraso' : 
                       'Inadimplente'}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/loans/${loan.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Detalhes
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