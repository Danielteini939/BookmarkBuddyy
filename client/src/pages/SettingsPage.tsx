import React, { useState } from "react";
import { useLoanContext } from "@/context/LoanContext";
import SettingsForm from "@/components/settings/SettingsForm";
import { useToast } from "@/hooks/use-toast";

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useLoanContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Make sure settings exist
  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Carregando configurações...</p>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateSettings(data);
      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SettingsForm
        settings={settings}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default SettingsPage;
