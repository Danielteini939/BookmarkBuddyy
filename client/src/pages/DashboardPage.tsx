import React, { useState } from "react";
import { useLoanContext } from "@/context/LoanContext";
import DashboardCards from "@/components/DashboardCards";
import LoanStatusChart from "@/components/LoanStatusChart";
import UpcomingDueLoans from "@/components/UpcomingDueLoans";
import OverdueLoansTable from "@/components/OverdueLoansTable";
import QuickActions from "@/components/QuickActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentForm from "@/components/payments/PaymentForm";

const DashboardPage: React.FC = () => {
  const {
    calculateLoanMetrics,
    getUpcomingDueLoans,
    getOverdueLoans,
    getLoanById,
    addPayment,
    borrowers,
  } = useLoanContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  const metrics = calculateLoanMetrics();
  const upcomingPayments = getUpcomingDueLoans();
  const overdueLoans = getOverdueLoans();

  const handleRegisterPayment = (loanId: number) => {
    setSelectedLoanId(loanId);
    setIsPaymentDialogOpen(true);
  };

  const handleSubmitPayment = async (paymentData: any) => {
    if (!selectedLoanId) return;

    setIsSubmitting(true);
    try {
      await addPayment({
        loanId: selectedLoanId,
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

  // Get selected loan for payment dialog
  const selectedLoan = selectedLoanId ? getLoanById(selectedLoanId) : null;
  const remainingBalance = 0; // This would be calculated based on the loan and payments

  return (
    <div className="space-y-6">
      <DashboardCards
        totalLent={metrics.totalLent}
        totalInterest={metrics.totalInterest}
        totalOverdue={metrics.totalOverdue}
        totalToReceive={metrics.totalToReceive}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoanStatusChart
          activeLoans={metrics.activeLoans}
          paidLoans={metrics.paidLoans}
          overdueLoans={metrics.overdueLoans}
          defaultedLoans={metrics.defaultedLoans}
          totalLoans={metrics.activeLoans + metrics.paidLoans + metrics.overdueLoans + metrics.defaultedLoans}
          totalBorrowers={borrowers.length}
        />

        <UpcomingDueLoans
          upcomingPayments={upcomingPayments}
          onRegisterPayment={handleRegisterPayment}
        />
      </div>

      <OverdueLoansTable
        overdueLoans={overdueLoans}
        onRegisterPayment={handleRegisterPayment}
      />

      <QuickActions />

      {selectedLoan && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>
                Informe os detalhes do pagamento para o empréstimo.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              loan={selectedLoan}
              remainingBalance={remainingBalance}
              onSubmit={handleSubmitPayment}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardPage;
