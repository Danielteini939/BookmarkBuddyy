import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useLoanContext } from "@/context/LoanContext";
import LoanForm from "@/components/loans/LoanForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoanFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    getLoanById,
    borrowers,
    settings,
    addLoan,
    updateLoan,
  } = useLoanContext();

  // Get loan data if editing an existing loan
  const loan = id ? getLoanById(parseInt(id)) : undefined;
  
  // If editing and loan not found, show an error message
  if (id && !loan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Empréstimo não encontrado
            </h2>
            <p className="text-slate-500 mb-6">
              O empréstimo que você está tentando editar não existe ou foi removido.
            </p>
            <Button onClick={() => navigate("/loans")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Empréstimos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (loan) {
        // Update existing loan
        await updateLoan(loan.id, data);
        toast({
          title: "Empréstimo atualizado",
          description: "O empréstimo foi atualizado com sucesso.",
        });
      } else {
        // Add new loan
        await addLoan(data);
        toast({
          title: "Empréstimo criado",
          description: "O empréstimo foi criado com sucesso.",
        });
      }
      navigate("/loans");
    } catch (error) {
      console.error("Error submitting loan:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o empréstimo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoanForm
      loan={loan}
      borrowers={borrowers}
      settings={settings || undefined}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default LoanFormPage;
