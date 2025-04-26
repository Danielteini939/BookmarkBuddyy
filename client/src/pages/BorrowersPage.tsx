import React from "react";
import { useLoanContext } from "@/context/LoanContext";
import BorrowersList from "@/components/borrowers/BorrowersList";
import { useToast } from "@/hooks/use-toast";

const BorrowersPage: React.FC = () => {
  const { borrowers, loans, deleteBorrower } = useLoanContext();
  const { toast } = useToast();

  // Handle delete borrower
  const handleDeleteBorrower = async (id: number) => {
    try {
      await deleteBorrower(id);
      toast({
        title: "Mutuário excluído",
        description: "O mutuário foi excluído com sucesso.",
      });
    } catch (error) {
      let errorMessage = "Não foi possível excluir o mutuário.";
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
      <BorrowersList 
        borrowers={borrowers} 
        loans={loans}
        onDeleteBorrower={handleDeleteBorrower} 
      />
    </div>
  );
};

export default BorrowersPage;
