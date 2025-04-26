import React, { useState } from "react";
import { Link } from "wouter";
import { Calendar, Clock, DollarSign, Percent, FileText, User, Phone, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loan, Borrower, Payment } from "@/types";
import { formatCurrency, formatDate, getStatusBadgeClasses, formatStatus, formatFrequency } from "@/utils/formatters";
import { calculateRemainingBalance } from "@/utils/loanCalculations";
import PaymentForm from "@/components/payments/PaymentForm";

interface LoanDetailProps {
  loan: Loan;
  borrower: Borrower;
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, "id">) => Promise<void>;
}

const LoanDetail: React.FC<LoanDetailProps> = ({
  loan,
  borrower,
  payments,
  onAddPayment,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const remainingBalance = calculateRemainingBalance(loan, payments);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestPaid = payments.reduce((sum, payment) => sum + payment.interest, 0);
  const totalPrincipalPaid = payments.reduce((sum, payment) => sum + payment.principal, 0);

  const handleSubmitPayment = async (paymentData: any) => {
    setIsSubmitting(true);
    try {
      await onAddPayment({
        loanId: loan.id,
        date: new Date().toISOString(),
        amount: parseFloat(paymentData.amount),
        principal: parseFloat(paymentData.principal),
        interest: parseFloat(paymentData.interest),
        notes: paymentData.notes || "",
      });
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error submitting payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Empréstimo #{loan.id}
          </h2>
          <p className="text-slate-500">
            Mutuário: {borrower.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/loans/${loan.id}/edit`}>Editar Empréstimo</Link>
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>Registrar Pagamento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
                <DialogDescription>
                  Informe os detalhes do pagamento para o empréstimo de {borrower.name}.
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                loan={loan}
                remainingBalance={remainingBalance}
                onSubmit={handleSubmitPayment}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Badge className={`${getStatusBadgeClasses(loan.status)} text-base`}>
                {formatStatus(loan.status)}
              </Badge>
              {loan.status !== "paid" && loan.nextPaymentDate && (
                <div className="text-sm text-slate-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Próximo Pagamento: {formatDate(loan.nextPaymentDate)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Valor Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-800">
              {formatCurrency(loan.principal)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Saldo Restante: {formatCurrency(remainingBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Juros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-800">
              {loan.interestRate.toFixed(2)}%
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Juros Pagos: {formatCurrency(totalInterestPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações do Empréstimo</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Data de Emissão</p>
                        <p className="text-slate-800">{formatDate(loan.issueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Data de Vencimento</p>
                        <p className="text-slate-800">{formatDate(loan.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Frequência de Pagamento</p>
                        <p className="text-slate-800">{formatFrequency(loan.frequency)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Valor da Parcela</p>
                        <p className="text-slate-800">{loan.installmentAmount ? formatCurrency(loan.installmentAmount) : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Percent className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Juros Total</p>
                        <p className="text-slate-800">
                          {loan.installmentAmount && loan.installments
                            ? formatCurrency((loan.installmentAmount * loan.installments) - loan.principal)
                            : "—"}
                        </p>
                      </div>
                    </div>
                    {loan.notes && (
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-slate-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-slate-500">Observações</p>
                          <p className="text-slate-800">{loan.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações do Mutuário</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Nome</p>
                        <p className="text-slate-800">{borrower.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Email</p>
                        <p className="text-slate-800">{borrower.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-500">Telefone</p>
                        <p className="text-slate-800">{borrower.phone || "—"}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" asChild>
                        <Link href={`/borrowers/${borrower.id}`}>
                          Ver Mutuário <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Total Pago</p>
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Principal Pago</p>
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(totalPrincipalPaid)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Juros Pago</p>
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(totalInterestPaid)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Saldo Restante</p>
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(remainingBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Todos os pagamentos registrados para este empréstimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Juros</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{formatCurrency(payment.principal)}</TableCell>
                          <TableCell>{formatCurrency(payment.interest)}</TableCell>
                          <TableCell>{payment.notes || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-500">Nenhum pagamento registrado ainda.</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    Registrar Primeiro Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanDetail;
