import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OverdueLoan } from "@/types";
import { formatCurrency, formatDate, getStatusBadgeClasses, formatStatus, getInitials } from "@/utils/formatters";

interface OverdueLoansTableProps {
  overdueLoans: OverdueLoan[];
  onRegisterPayment: (loanId: number) => void;
}

const OverdueLoansTable: React.FC<OverdueLoansTableProps> = ({
  overdueLoans,
  onRegisterPayment,
}) => {
  return (
    <Card className="border border-slate-200">
      <CardHeader className="p-5 border-b border-slate-200 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Empréstimos em Atraso
        </CardTitle>
        {overdueLoans.length > 0 && (
          <Button variant="link" asChild className="text-emerald-600 hover:text-emerald-700 h-auto p-0">
            <Link href="/loans?status=overdue">Ver todos</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {overdueLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[250px]">Mutuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Dias em Atraso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                          <span className="text-xs font-medium">
                            {getInitials(loan.borrowerName)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-800">
                            {loan.borrowerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {loan.borrowerEmail || "Sem email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-800">
                        {formatCurrency(loan.principal)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Parcela: {formatCurrency(loan.installmentAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-800">
                        {formatDate(loan.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-red-600">
                        {loan.daysOverdue} {loan.daysOverdue === 1 ? "dia" : "dias"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClasses(loan.status)}
                      >
                        {formatStatus(loan.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="link"
                        className="text-emerald-600 hover:text-emerald-700 mr-3 h-auto p-0"
                        onClick={() => onRegisterPayment(loan.id)}
                      >
                        Pagar
                      </Button>
                      <Button
                        variant="link"
                        className="text-primary-600 hover:text-primary-700 h-auto p-0"
                        asChild
                      >
                        <Link href={`/loans/${loan.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center p-6">
            <p className="text-slate-500">
              Não há empréstimos em atraso.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverdueLoansTable;
