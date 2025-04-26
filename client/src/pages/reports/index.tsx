import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DownloadCloud,
  UploadCloud,
  FileBarChart,
  FileSpreadsheet,
  PieChart,
  DollarSign,
} from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency, formatDate, getStatusName } from "@/utils/formatters";
import { downloadCSV } from "@/utils/csvHelpers";

export default function ReportsPage() {
  const { 
    loans, 
    borrowers, 
    payments, 
    getDashboardMetrics, 
    exportData, 
    importData 
  } = useLoan();
  const [activeTab, setActiveTab] = useState("summary");
  
  const metrics = getDashboardMetrics();
  
  // Handler for exporting data
  const handleExport = () => {
    const csvData = exportData();
    downloadCSV(csvData, `loanbuddy_export_${formatDateForFilename(new Date())}.csv`);
  };
  
  // Handler for importing data
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
  };
  
  // Format date for filename (yyyy-mm-dd)
  const formatDateForFilename = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-slate-500">
            Visualize e exporte dados do sistema
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button onClick={handleExport}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline">
            <label className="flex items-center cursor-pointer">
              <UploadCloud className="h-4 w-4 mr-2" />
              Importar CSV
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleImport}
              />
            </label>
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="loans">Empréstimos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Visão Geral
                </CardTitle>
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Total de Mutuários</span>
                    <span className="font-medium">{borrowers.length}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Total de Empréstimos</span>
                    <span className="font-medium">{loans.length}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Total de Pagamentos</span>
                    <span className="font-medium">{payments.length}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Empréstimos Ativos</span>
                    <span className="font-medium">{metrics.activeLoanCount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Empréstimos Pagos</span>
                    <span className="font-medium">{metrics.paidLoanCount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Empréstimos Vencidos</span>
                    <span className="font-medium">{metrics.overdueLoanCount}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500">Empréstimos Inadimplentes</span>
                    <span className="font-medium">{metrics.defaultedLoanCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Métricas Financeiras
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Total Emprestado</span>
                    <span className="font-medium">{formatCurrency(metrics.totalLoaned)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Juros Acumulados</span>
                    <span className="font-medium">{formatCurrency(metrics.totalInterestAccrued)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Valor em Atraso</span>
                    <span className="font-medium">{formatCurrency(metrics.totalOverdue)}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500">Taxa de Inadimplência</span>
                    <span className="font-medium">
                      {metrics.totalLoaned ? 
                        ((metrics.totalOverdue / metrics.totalLoaned) * 100).toFixed(2) + "%" 
                        : "0%"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="loans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Empréstimos</CardTitle>
              <CardDescription>
                Dados detalhados de todos os empréstimos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Mutuário</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Emissão</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhum empréstimo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        loans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>{loan.id}</TableCell>
                            <TableCell>{loan.borrowerName}</TableCell>
                            <TableCell>{formatCurrency(loan.principal)}</TableCell>
                            <TableCell>{loan.interestRate}%</TableCell>
                            <TableCell>{formatDate(loan.issueDate)}</TableCell>
                            <TableCell>{formatDate(loan.dueDate)}</TableCell>
                            <TableCell>{getStatusName(loan.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={handleExport}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Financeiro</CardTitle>
              <CardDescription>
                Resumo financeiro dos empréstimos e pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Emprestado</TableCell>
                        <TableCell className="text-right">{formatCurrency(metrics.totalLoaned)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Juros Acumulados</TableCell>
                        <TableCell className="text-right">{formatCurrency(metrics.totalInterestAccrued)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Valor em Atraso</TableCell>
                        <TableCell className="text-right">{formatCurrency(metrics.totalOverdue)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(metrics.totalLoaned + metrics.totalInterestAccrued)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pagamentos Recentes</h3>
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Mutuário</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Juros</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                Nenhum pagamento encontrado.
                              </TableCell>
                            </TableRow>
                          ) : (
                            payments
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .slice(0, 5)
                              .map((payment) => {
                                const loan = loans.find(l => l.id === payment.loanId);
                                return (
                                  <TableRow key={payment.id}>
                                    <TableCell>{formatDate(payment.date)}</TableCell>
                                    <TableCell>{loan?.borrowerName || "Desconhecido"}</TableCell>
                                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{formatCurrency(payment.principal)}</TableCell>
                                    <TableCell>{formatCurrency(payment.interest)}</TableCell>
                                  </TableRow>
                                );
                              })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={handleExport}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
