import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLoan } from '@/context/LoanContext';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  
  try {
    const { getDashboardMetrics } = useLoan();
    const metrics = getDashboardMetrics();
    
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="default" disabled>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
  
        {/* Resumo rápido de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Total Emprestado</h3>
              <p className="text-3xl font-bold">{formatCurrency(metrics.totalLoaned)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Juros Acumulados</h3>
              <p className="text-3xl font-bold">{formatCurrency(metrics.totalInterestAccrued)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Recebido no Mês</h3>
              <p className="text-3xl font-bold">{formatCurrency(metrics.totalReceivedThisMonth)}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumo Geral</SelectItem>
                <SelectItem value="loans">Empréstimos</SelectItem>
                <SelectItem value="payments">Pagamentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-range">Período</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="date-range">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Conteúdo do relatório */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Relatório em Desenvolvimento</h2>
              <p className="text-muted-foreground mt-2">
                Estamos implementando os gráficos e recursos de exportação.
              </p>
            </div>
            
            <Tabs value={reportType} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="summary" onClick={() => setReportType('summary')}>Resumo</TabsTrigger>
                <TabsTrigger value="loans" onClick={() => setReportType('loans')}>Empréstimos</TabsTrigger>
                <TabsTrigger value="payments" onClick={() => setReportType('payments')}>Pagamentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <div className="text-center py-8">
                  <p>O resumo geral incluirá gráficos de status de empréstimos e pagamentos ao longo do tempo.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="loans">
                <div className="text-center py-8">
                  <p>A tabela detalhada de empréstimos estará disponível em breve.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="payments">
                <div className="text-center py-8">
                  <p>A tabela de pagamentos por período estará disponível em breve.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Erro no contexto LoanProvider:", error);
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar relatórios</h1>
            <p className="mb-2">Não foi possível acessar os dados de empréstimos.</p>
            <p>Por favor, tente atualizar a página ou contate o suporte.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}