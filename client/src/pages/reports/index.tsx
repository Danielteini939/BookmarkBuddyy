import React from 'react';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { useLoan } from '@/context/LoanContext';

export default function ReportsPage() {
  // Verificamos se o contexto está acessível aqui para garantir que o componente seja renderizado corretamente
  const loanContext = useLoan();
  
  return (
    <div className="container mx-auto">
      <ReportGenerator />
    </div>
  );
}