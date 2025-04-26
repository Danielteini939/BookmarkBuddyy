import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useLoanContext } from "@/context/LoanContext";
import BorrowerForm from "@/components/borrowers/BorrowerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BorrowerFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    getBorrowerById,
    addBorrower,
    updateBorrower,
  } = useLoanContext();

  // Get borrower data if editing an existing borrower
  const borrower = id ? getBorrowerById(parseInt(id)) : undefined;
  
  // If editing and borrower not found, show an error message
  if (id && !borrower) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Mutuário não encontrado
            </h2>
            <p className="text-slate-500 mb-6">
              O mutuário que você está tentando editar não existe ou foi removido.
            </p>
            <Button onClick={() => navigate("/borrowers")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Mutuários
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
      if (borrower) {
        // Update existing borrower
        await updateBorrower(borrower.id, data);
        toast({
          title: "Mutuário atualizado",
          description: "O mutuário foi atualizado com sucesso.",
        });
      } else {
        // Add new borrower
        await addBorrower(data);
        toast({
          title: "Mutuário criado",
          description: "O mutuário foi criado com sucesso.",
        });
      }
      navigate("/borrowers");
    } catch (error) {
      console.error("Error submitting borrower:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o mutuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BorrowerForm
      borrower={borrower}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default BorrowerFormPage;
