import React from "react";
import { useLoanContext } from "@/context/LoanContext";
import LoansList from "@/components/loans/LoansList";
import { useToast } from "@/hooks/use-toast";

const LoansPage: React.FC = () => {
  const { getLoansWithBorrowers, deleteLoan } = useLoanContext();
  const { toast } = useToast();

  // Get loans data
  const loans = getLoansWithBorrowers();

  // Handle delete loan
  const handleDeleteLoan = async (id: number) => {
    try {
      await deleteLoan(id);
      toast({
        title: "Empréstimo excluído",
        description: "O empréstimo foi excluído com sucesso.",
      });
    } catch (error) {
      let errorMessage = "Não foi possível excluir o empréstimo.";
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
      <LoansList loans={loans} onDeleteLoan={handleDeleteLoan} />
    </div>
  );
};

export default LoansPage;
