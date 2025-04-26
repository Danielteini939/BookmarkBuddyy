import React, { useState } from "react";
import { Search, Calendar, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal } from "lucide-react";
import { Payment, Borrower, Loan } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface PaymentsListProps {
  payments: Payment[];
  loans: Loan[];
  borrowers: Borrower[];
  onDeletePayment: (id: number) => Promise<void>;
}

interface PaymentWithDetails extends Payment {
  borrowerName: string;
  loanAmount: number;
}

const PaymentsList: React.FC<PaymentsListProps> = ({
  payments,
  loans,
  borrowers,
  onDeletePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [borrowerFilter, setBorrowerFilter] = useState("all");
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Enrich payments with loan and borrower details
  const enrichedPayments: PaymentWithDetails[] = payments.map((payment) => {
    const loan = loans.find((loan) => loan.id === payment.loanId);
    const borrower = loan ? borrowers.find((b) => b.id === loan.borrowerId) : null;
    
    return {
      ...payment,
      borrowerName: borrower?.name || "Desconhecido",
      loanAmount: loan?.principal || 0,
    };
  });

  // Filter payments
  const filteredPayments = enrichedPayments.filter((payment) => {
    const matchesSearch = payment.borrowerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBorrower =
      borrowerFilter === "all" ||
      (borrowerFilter && payment.borrowerName === borrowerFilter);
    
    return matchesSearch && matchesBorrower;
  });

  // Get unique borrower names for filter
  const uniqueBorrowers = Array.from(
    new Set(enrichedPayments.map((payment) => payment.borrowerName))
  );

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
  };

  const handleConfirmDelete = async () => {
    if (paymentToDelete) {
      await onDeletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            Histórico de todos os pagamentos registrados
          </CardDescription>
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
              value={borrowerFilter}
              onValueChange={setBorrowerFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Mutuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Mutuários</SelectItem>
                {uniqueBorrowers.map((borrower) => (
                  <SelectItem key={borrower} value={borrower}>
                    {borrower}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Mutuário</TableHead>
                  <TableHead>ID Empréstimo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Juros</TableHead>
                  <TableHead>Obs</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium">{payment.borrowerName}</TableCell>
                      <TableCell>#{payment.loanId}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatCurrency(payment.principal)}</TableCell>
                      <TableCell>{formatCurrency(payment.interest)}</TableCell>
                      <TableCell>
                        {payment.notes ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={payment.notes}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(payment)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum pagamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={paymentToDelete !== null}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pagamento será removido permanentemente
              e o status do empréstimo poderá ser alterado como resultado.
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

export default PaymentsList;
