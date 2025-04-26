import React from "react";
import { useLoanContext } from "@/context/LoanContext";
import PaymentsList from "@/components/payments/PaymentsList";
import { useToast } from "@/hooks/use-toast";

const PaymentsPage: React.FC = () => {
  const { payments, loans, borrowers, deletePayment } = useLoanContext();
  const { toast } = useToast();

  // Handle delete payment
  const handleDeletePayment = async (id: number) => {
    try {
      await deletePayment(id);
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      });
    } catch (error) {
      let errorMessage = "Não foi possível excluir o pagamento.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PaymentsList 
        payments={payments} 
        loans={loans}
        borrowers={borrowers}
        onDeletePayment={handleDeletePayment} 
      />
    </div>
  );
};

export default PaymentsPage;
