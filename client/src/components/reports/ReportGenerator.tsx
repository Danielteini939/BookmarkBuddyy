import React, { useState } from "react";
import { FileDown, FileUp, UploadCloud, DownloadCloud, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Borrower, Loan, Payment } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ReportGeneratorProps {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  borrowers,
  loans,
  payments,
  exportData,
  importData,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Calculate summary metrics
  const activeLoanCount = loans.filter(loan => loan.status === "active").length;
  const totalLent = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestPaid = payments.reduce((sum, payment) => sum + payment.interest, 0);
  const totalPrincipalPaid = payments.reduce((sum, payment) => sum + payment.principal, 0);
  const outstandingPrincipal = totalLent - totalPrincipalPaid;

  // Number of loans by status
  const statusCounts = {
    active: loans.filter(loan => loan.status === "active").length,
    paid: loans.filter(loan => loan.status === "paid").length,
    overdue: loans.filter(loan => loan.status === "overdue").length,
    defaulted: loans.filter(loan => loan.status === "defaulted").length,
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(20);
    setImportError(null);
    setImportSuccess(false);

    try {
      // Simulate progress for better UX
      setTimeout(() => setImportProgress(50), 500);
      setTimeout(() => setImportProgress(80), 1000);

      const result = await importData(file);
      
      setTimeout(() => {
        setImportProgress(100);
        setImportSuccess(result);
        if (!result) {
          setImportError("Falha ao importar dados. Verifique o formato do arquivo.");
        }
        setIsImporting(false);
      }, 1500);
    } catch (error) {
      setImportProgress(100);
      setImportError("Erro ao processar o arquivo: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      setIsImporting(false);
    }
  };

  return (
    <Tabs defaultValue="summary">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary">Resumo</TabsTrigger>
        <TabsTrigger value="export">Exportar Dados</TabsTrigger>
        <TabsTrigger value="import">Importar Dados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>
              Visão geral de todas as atividades financeiras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Total Emprestado</p>
                <p className="text-xl font-semibold text-slate-800">{formatCurrency(totalLent)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Total Principal Pago</p>
                <p className="text-xl font-semibold text-slate-800">{formatCurrency(totalPrincipalPaid)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Principal em Aberto</p>
                <p className="text-xl font-semibold text-slate-800">{formatCurrency(outstandingPrincipal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Total de Juros Recebidos</p>
                <p className="text-xl font-semibold text-slate-800">{formatCurrency(totalInterestPaid)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Total de Pagamentos</p>
                <p className="text-xl font-semibold text-slate-800">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Número de Empréstimos Ativos</p>
                <p className="text-xl font-semibold text-slate-800">{activeLoanCount}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Estatus dos Empréstimos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-800">Ativos</p>
                  <p className="text-lg font-semibold text-emerald-900">{statusCounts.active}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">Pagos</p>
                  <p className="text-lg font-semibold text-blue-900">{statusCounts.paid}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-sm font-medium text-amber-800">Vencidos</p>
                  <p className="text-lg font-semibold text-amber-900">{statusCounts.overdue}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800">Inadimplentes</p>
                  <p className="text-lg font-semibold text-red-900">{statusCounts.defaulted}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Resumo de Dados</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total de Mutuários:</span>
                    <span className="font-medium">{borrowers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total de Empréstimos:</span>
                    <span className="font-medium">{loans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total de Pagamentos:</span>
                    <span className="font-medium">{payments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Última Atualização:</span>
                    <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={exportData} className="w-full">
              <FileDown className="mr-2 h-4 w-4" /> Exportar Relatório Completo
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="export">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>
              Exporte todos os seus dados para backup ou transferência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-medium mb-2">O que será exportado?</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  <li>Dados de todos os mutuários ({borrowers.length} registros)</li>
                  <li>Dados de todos os empréstimos ({loans.length} registros)</li>
                  <li>Histórico completo de pagamentos ({payments.length} registros)</li>
                  <li>Configurações do sistema</li>
                </ul>
              </div>
              
              <Alert>
                <DownloadCloud className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Os dados serão exportados em formato CSV compatível. Guarde este arquivo em um local seguro
                  para fazer backup ou transferir seus dados para outra instalação.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={exportData} className="w-full">
              <FileDown className="mr-2 h-4 w-4" /> Exportar Todos os Dados
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="import">
        <Card>
          <CardHeader>
            <CardTitle>Importar Dados</CardTitle>
            <CardDescription>
              Restaure seus dados a partir de um arquivo exportado anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <UploadCloud className="h-4 w-4" />
              <AlertTitle>Atenção!</AlertTitle>
              <AlertDescription>
                A importação substituirá todos os dados existentes. Certifique-se de fazer um backup 
                antes de prosseguir. Apenas arquivos exportados do LoanBuddy são compatíveis.
              </AlertDescription>
            </Alert>

            {importError && (
              <Alert variant="destructive">
                <AlertTitle>Erro ao importar</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                <RefreshCw className="h-4 w-4" />
                <AlertTitle>Importação concluída</AlertTitle>
                <AlertDescription>
                  Seus dados foram importados com sucesso. A página será recarregada automaticamente.
                </AlertDescription>
              </Alert>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Importando dados...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="import-file">Selecione o arquivo para importar</Label>
              <Input 
                id="import-file" 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()} className="w-full" disabled={isImporting}>
              <FileUp className="mr-2 h-4 w-4" /> Selecionar Arquivo para Importar
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ReportGenerator;
