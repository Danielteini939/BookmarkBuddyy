import React from "react";
import { useParams, useLocation } from "wouter";
import { useLoanContext } from "@/context/LoanContext";
import LoanDetail from "@/components/loans/LoanDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const {
    getLoanById,
    getBorrowerById,
    getPaymentsByLoanId,
    addPayment,
  } = useLoanContext();

  // Convert id to number
  const loanId = parseInt(id || "0");
  
  // Get loan data
  const loan = getLoanById(loanId);
  
  // If loan not found, show an error message
  if (!loan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Empréstimo não encontrado
            </h2>
            <p className="text-slate-500 mb-6">
              O empréstimo que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate("/loans")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Empréstimos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get borrower and payments data
  const borrower = getBorrowerById(loan.borrowerId);
  const payments = getPaymentsByLoanId(loan.id);

  // If borrower not found (shouldn't happen), show an error
  if (!borrower) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Erro ao carregar dados
            </h2>
            <p className="text-slate-500 mb-6">
              Não foi possível encontrar o mutuário associado a este empréstimo.
            </p>
            <Button onClick={() => navigate("/loans")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Empréstimos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle add payment
  const handleAddPayment = async (paymentData: any) => {
    try {
      await addPayment(paymentData);
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <LoanDetail
      loan={loan}
      borrower={borrower}
      payments={payments}
      onAddPayment={handleAddPayment}
    />
  );
};

export default LoanDetailPage;
