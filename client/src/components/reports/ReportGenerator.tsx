import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLoan } from '@/context/LoanContext';
import { LoanType, PaymentType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate, formatPercentage, getStatusName } from '@/utils/formatters';
import { Printer, FileDown, BarChart4 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Definir cores para o gráfico de Status dos Empréstimos
const COLORS = ['#4ade80', '#f87171', '#fb923c', '#60a5fa'];

const ReportGenerator = () => {
  const { loans, payments, borrowers, getDashboardMetrics } = useLoan();
  const [reportType, setReportType] = useState<string>('summary');
  const [dateRange, setDateRange] = useState<string>('month');
  const reportRef = useRef<HTMLDivElement>(null);

  // Filtrar pagamentos com base no período selecionado
  const getFilteredPayments = (): PaymentType[] => {
    const now = new Date();
    let startDate = new Date();
    
    if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (dateRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else if (dateRange === 'all') {
      startDate = new Date(0); // Desde o início dos tempos
    }
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startDate && paymentDate <= now;
    });
  };

  // Preparar dados para os gráficos
  const getStatusChartData = () => {
    const metrics = getDashboardMetrics();
    return [
      { name: 'Ativos', value: metrics.activeLoanCount },
      { name: 'Vencidos', value: metrics.overdueLoanCount },
      { name: 'Em Atraso', value: metrics.defaultedLoanCount },
      { name: 'Pagos', value: metrics.paidLoanCount }
    ];
  };

  const getPaymentsChartData = () => {
    const filteredPayments = getFilteredPayments();
    const paymentsByMonth: Record<string, { month: string, total: number, principal: number, interest: number }> = {};
    
    filteredPayments.forEach(payment => {
      const date = new Date(payment.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM/yy', { locale: ptBR });
      
      if (!paymentsByMonth[monthKey]) {
        paymentsByMonth[monthKey] = {
          month: monthName,
          total: 0,
          principal: 0,
          interest: 0
        };
      }
      
      paymentsByMonth[monthKey].total += Number(payment.amount);
      paymentsByMonth[monthKey].principal += Number(payment.principal);
      paymentsByMonth[monthKey].interest += Number(payment.interest);
    });
    
    // Converter para array e ordenar por data
    return Object.values(paymentsByMonth).sort((a, b) => 
      a.month.localeCompare(b.month)
    );
  };

  // Funções para geração de PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const title = 'Relatório de Empréstimos';

    // Título e cabeçalho
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Período do relatório: ${getPeriodLabel()}`, 14, 36);

    // Resumo geral
    const metrics = getDashboardMetrics();
    doc.setFontSize(14);
    doc.text('Resumo Geral', 14, 46);
    doc.setFontSize(10);
    doc.text(`Total Emprestado: ${formatCurrency(metrics.totalLoaned)}`, 14, 54);
    doc.text(`Total Recebido (no período): ${formatCurrency(metrics.totalReceivedThisMonth)}`, 14, 60);
    doc.text(`Juros Acumulados: ${formatCurrency(metrics.totalInterestAccrued)}`, 14, 66);
    doc.text(`Total de Empréstimos: ${metrics.activeLoanCount + metrics.paidLoanCount + metrics.overdueLoanCount + metrics.defaultedLoanCount}`, 14, 72);
    doc.text(`Empréstimos Ativos: ${metrics.activeLoanCount}`, 14, 78);
    doc.text(`Empréstimos Vencidos: ${metrics.overdueLoanCount}`, 14, 84);
    doc.text(`Empréstimos Pagos: ${metrics.paidLoanCount}`, 14, 90);

    // Tabela de Empréstimos
    if (reportType === 'loans' || reportType === 'summary') {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Lista de Empréstimos', 14, 22);
      
      // @ts-ignore - jspdf-autotable não tem tipagem correta
      doc.autoTable({
        startY: 30,
        head: [['Mutuário', 'Valor', 'Taxa', 'Data de Emissão', 'Vencimento', 'Status']],
        body: loans.map(loan => [
          getBorrowerName(loan.borrowerId),
          formatCurrency(Number(loan.principal)),
          formatPercentage(Number(loan.interestRate)),
          formatDate(loan.issueDate),
          formatDate(loan.dueDate),
          getStatusName(loan.status)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [75, 85, 99] }
      });
    }

    // Tabela de Pagamentos
    if (reportType === 'payments' || reportType === 'summary') {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Pagamentos Recentes', 14, 22);
      
      const filteredPayments = getFilteredPayments();
      
      // @ts-ignore
      doc.autoTable({
        startY: 30,
        head: [['Data', 'Empréstimo', 'Valor', 'Principal', 'Juros']],
        body: filteredPayments.map(payment => {
          const loan = loans.find(l => l.id === payment.loanId);
          const borrowerName = loan ? getBorrowerName(loan.borrowerId) : 'N/A';
          return [
            formatDate(payment.date),
            borrowerName,
            formatCurrency(Number(payment.amount)),
            formatCurrency(Number(payment.principal)),
            formatCurrency(Number(payment.interest))
          ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [75, 85, 99] }
      });
    }

    doc.save('relatorio-emprestimos.pdf');
  };

  // Função para obter o nome do período selecionado
  const getPeriodLabel = (): string => {
    switch (dateRange) {
      case 'month':
        return 'Último mês';
      case 'quarter':
        return 'Últimos 3 meses';
      case 'year':
        return 'Último ano';
      case 'all':
        return 'Todo o período';
      default:
        return 'Período personalizado';
    }
  };

  // Função para obter o nome do mutuário
  const getBorrowerName = (borrowerId: string): string => {
    const borrower = borrowers.find(b => b.id === borrowerId);
    return borrower ? borrower.name : 'Desconhecido';
  };

  // Hook para impressão
  const handlePrint = useReactToPrint({
    documentTitle: 'Relatório de Empréstimos',
    copyStyles: true,
    // @ts-ignore - Há um problema com a tipagem da biblioteca
    content: () => reportRef.current,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={generatePDF} variant="default">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
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

      {/* Conteúdo do relatório para impressão */}
      <div ref={reportRef} className="p-4 bg-white rounded-lg space-y-6 print:max-w-full print:my-6">
        <div className="text-center print:mb-6">
          <h1 className="text-3xl font-bold">Relatório de Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </p>
          <p className="text-muted-foreground">
            Período: {getPeriodLabel()}
          </p>
        </div>

        <Tabs defaultValue="summary" value={reportType} className="print:block">
          <TabsList className="print:hidden">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="loans">Empréstimos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-2">Total Emprestado</h3>
                  <p className="text-3xl font-bold">{formatCurrency(getDashboardMetrics().totalLoaned)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-2">Juros Acumulados</h3>
                  <p className="text-3xl font-bold">{formatCurrency(getDashboardMetrics().totalInterestAccrued)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-2">Recebido no Período</h3>
                  <p className="text-3xl font-bold">{formatCurrency(getDashboardMetrics().totalReceivedThisMonth)}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Status dos Empréstimos</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getStatusChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getStatusChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} empréstimos`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Pagamentos por Período</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getPaymentsChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                        <Legend />
                        <Bar name="Principal" dataKey="principal" fill="#818cf8" />
                        <Bar name="Juros" dataKey="interest" fill="#f472b6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="loans">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Lista de Empréstimos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted">
                        <th className="py-3 px-4 text-left">Mutuário</th>
                        <th className="py-3 px-4 text-right">Valor</th>
                        <th className="py-3 px-4 text-right">Taxa</th>
                        <th className="py-3 px-4 text-left">Data de Emissão</th>
                        <th className="py-3 px-4 text-left">Vencimento</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{loan.borrowerName}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(Number(loan.principal))}</td>
                          <td className="py-3 px-4 text-right">{formatPercentage(Number(loan.interestRate))}</td>
                          <td className="py-3 px-4">{formatDate(loan.issueDate)}</td>
                          <td className="py-3 px-4">{formatDate(loan.dueDate)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.status === 'active' ? 'bg-green-100 text-green-800' :
                              loan.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                              loan.status === 'overdue' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusName(loan.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Pagamentos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted">
                        <th className="py-3 px-4 text-left">Data</th>
                        <th className="py-3 px-4 text-left">Empréstimo</th>
                        <th className="py-3 px-4 text-right">Valor</th>
                        <th className="py-3 px-4 text-right">Principal</th>
                        <th className="py-3 px-4 text-right">Juros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredPayments().map((payment) => {
                        const loan = loans.find(l => l.id === payment.loanId);
                        return (
                          <tr key={payment.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{formatDate(payment.date)}</td>
                            <td className="py-3 px-4">
                              {loan ? loan.borrowerName : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right">{formatCurrency(Number(payment.amount))}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(Number(payment.principal))}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(Number(payment.interest))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* @ts-ignore - estilo para impressão */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; }
          body * { visibility: hidden; }
          #report-container, #report-container * { visibility: visible; }
          #report-container { position: absolute; left: 0; top: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:max-w-full { max-width: 100% !important; }
          .print\\:my-6 { margin-top: 1.5rem !important; margin-bottom: 1.5rem !important; }
          .print\\:mb-6 { margin-bottom: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportGenerator;