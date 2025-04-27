import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ReportGenerator = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-2">Página de Relatórios</h3>
          <p className="text-gray-700">
            Esta página está em desenvolvimento. Em breve, você poderá:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-2">
            <li>Visualizar resumos financeiros com gráficos</li>
            <li>Exportar relatórios em PDF</li>
            <li>Imprimir relatórios detalhados</li>
            <li>Filtrar dados por período</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;