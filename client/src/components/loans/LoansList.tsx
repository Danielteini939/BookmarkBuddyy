import React, { useState } from "react";
import { Link } from "wouter";
import { Search, Edit, Trash2, Plus, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoanWithBorrower } from "@/types";
import { formatCurrency, formatDate, getStatusBadgeClasses, formatStatus } from "@/utils/formatters";

interface LoansListProps {
  loans: LoanWithBorrower[];
  onDeleteLoan: (id: number) => Promise<void>;
}

const LoansList: React.FC<LoansListProps> = ({ loans, onDeleteLoan }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanToDelete, setLoanToDelete] = useState<LoanWithBorrower | null>(null);

  // Filter loans based on search query and status
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = loan.borrowerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (loan: LoanWithBorrower) => {
    setLoanToDelete(loan);
  };

  const handleConfirmDelete = async () => {
    if (loanToDelete) {
      await onDeleteLoan(loanToDelete.id);
      setLoanToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Empréstimos</CardTitle>
          <Button asChild>
            <Link href="/loans/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Empréstimo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por mutuário..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="defaulted">Inadimplentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Mutuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Taxa de Juros</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Próximo Pgto.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-medium">{loan.borrowerName}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(loan.principal)}</TableCell>
                      <TableCell>{loan.interestRate.toFixed(2)}%</TableCell>
                      <TableCell>{formatDate(loan.dueDate)}</TableCell>
                      <TableCell>
                        {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClasses(loan.status)}>
                          {formatStatus(loan.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/loans/${loan.id}`}>
                              <Calendar className="h-4 w-4" />
                              <span className="sr-only">Detalhes</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/loans/${loan.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(loan)}
                            disabled={loan.status !== "active"}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum empréstimo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={loanToDelete !== null}
        onOpenChange={(open) => !open && setLoanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              empréstimo de {loanToDelete?.borrowerName} no valor de {loanToDelete && formatCurrency(loanToDelete.principal)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LoansList;
