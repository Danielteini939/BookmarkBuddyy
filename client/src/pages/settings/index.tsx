import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { useLoan } from "@/context/LoanContext";
import { PaymentFrequency } from "@/types";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Save, InfoCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { downloadCSV } from "@/utils/csvHelpers";
import { 
  createBackup, 
  downloadBackup, 
  validateBackup,
  BackupData 
} from "@/utils/backupHelpers";

// Form schema
const settingsFormSchema = z.object({
  defaultInterestRate: z.coerce.number().min(0, "Taxa deve ser maior ou igual a zero"),
  defaultPaymentFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly", "custom"] as const),
  defaultInstallments: z.coerce.number().int().positive("Número de parcelas deve ser positivo"),
  currency: z.string().min(1, "Moeda não pode estar vazia"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData, borrowers, loans, payments } = useLoan();
  const { toast } = useToast();
  
  // Estado para importação/exportação
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupDescription, setBackupDescription] = useState<string>("");
  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);
  
  // Aviso sobre modo sem persistência
  useEffect(() => {
    console.log("Sistema operando sem persistência de dados. Dados existem apenas em memória.");
  }, []);

  // Form setup with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      defaultInterestRate: settings.defaultInterestRate,
      defaultPaymentFrequency: settings.defaultPaymentFrequency,
      defaultInstallments: settings.defaultInstallments,
      currency: settings.currency,
    },
  });

  // Função para salvar as configurações
  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso."
    });
  };
  
  // Função para exportar em CSV
  const handleExportCsv = () => {
    const csvData = exportData();
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csvData, `loanbuddy_export_${date}.csv`);
    
    toast({
      title: "Dados exportados",
      description: "Os dados foram exportados com sucesso em formato CSV."
    });
  };
  
  // Função para exportar backup em JSON
  const handleExportJson = () => {
    setIsCreatingBackup(true);
    
    try {
      const backupData = createBackup(
        borrowers, 
        loans, 
        payments, 
        settings,
        backupDescription || `Backup manual - ${new Date().toLocaleString()}`
      );
      
      downloadBackup(backupData);
      
      toast({
        title: "Backup criado",
        description: "O backup foi criado e baixado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      toast({
        title: "Erro ao criar backup",
        description: "Ocorreu um erro ao criar o backup. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupDescription("");
    }
  };
  
  // Função para restaurar a partir de CSV
  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          importData(content);
          
          toast({
            title: "Dados importados",
            description: "Os dados foram importados com sucesso do arquivo CSV."
          });
          
          // Limpar o input
          if (fileInputCsvRef.current) {
            fileInputCsvRef.current.value = '';
          }
        } catch (error) {
          console.error("Erro na importação:", error);
          toast({
            title: "Erro na importação",
            description: error instanceof Error ? error.message : "Erro desconhecido na importação de dados",
            variant: "destructive"
          });
        }
      }
    };
    reader.readAsText(file);
  };
  
  // Função para restaurar a partir de JSON
  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Arquivo vazio");
        
        const backupData = JSON.parse(content) as BackupData;
        const validation = validateBackup(backupData);
        
        if (!validation.valid) {
          toast({
            title: "Erro de validação",
            description: `O arquivo de backup é inválido: ${validation.errors.join(", ")}`,
            variant: "destructive"
          });
          return;
        }
        
        // Realizar a importação se dados válidos
        importData(JSON.stringify({
          borrowers: backupData.borrowers,
          loans: backupData.loans,
          payments: backupData.payments
        }));
        
        // Também importar configurações
        updateSettings(backupData.settings);
        
        toast({
          title: "Backup restaurado",
          description: "Os dados foram restaurados com sucesso do arquivo de backup."
        });
        
        // Limpar o input
        if (fileInputJsonRef.current) {
          fileInputJsonRef.current.value = '';
        }
      } catch (error) {
        console.error("Erro ao processar arquivo JSON:", error);
        toast({
          title: "Erro na importação",
          description: "O arquivo não contém um backup válido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };
  
  // Função para reiniciar dados
  const handleReset = () => {
    if (window.confirm('Você tem certeza? Todos os dados serão perdidos!')) {
      importData('RESET');
      toast({
        title: "Dados reiniciados",
        description: "Todos os dados foram limpos e restaurados para os valores iniciais."
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="general" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Gerais</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure valores padrão para novos empréstimos e preferências do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="defaultInterestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa de Juros Padrão (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="5.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Taxa de juros mensal usada como padrão para novos empréstimos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="defaultPaymentFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência de Pagamento Padrão</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência padrão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="biweekly">Quinzenal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Frequência de pagamento usada como padrão para novos empréstimos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="defaultInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas Padrão</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de parcelas usado como padrão para novos empréstimos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moeda</FormLabel>
                        <FormControl>
                          <Input placeholder="R$" {...field} />
                        </FormControl>
                        <FormDescription>
                          Símbolo da moeda a ser exibido nos valores monetários
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
              <CardDescription>
                Limpe ou restaure os dados da aplicação. Cuidado: estas ações não podem ser desfeitas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Reiniciar Dados</div>
                <p className="text-sm text-slate-500">
                  Limpa todos os dados e restaura para os valores iniciais. Esta ação não pode ser desfeita.
                </p>
                <Button 
                  variant="destructive"
                  onClick={handleReset}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reiniciar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>
                Faça backup dos seus dados para arquivos locais (sem utilizar cookies ou localStorage)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Modo sem persistência local</AlertTitle>
                <AlertDescription>
                  O aplicativo está operando em modo sem persistência. Seus dados NÃO são salvos em cookies 
                  ou localStorage do navegador, existindo apenas em memória durante esta sessão.
                  <strong className="block mt-2">Faça backups regulares para evitar perda de dados!</strong>
                </AlertDescription>
              </Alert>
              
              {/* Exportação e Importação */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Exportar e Importar</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Exportar dados</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default" onClick={handleExportJson}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar JSON
                      </Button>
                      
                      <Button variant="outline" onClick={handleExportCsv}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                    
                    <p className="text-sm text-slate-500 mt-2">
                      O formato JSON preserva todos os dados, incluindo configurações.
                      O formato CSV é compatível com planilhas.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Importar dados</h4>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div>
                        <Label htmlFor="file-json" className="block mb-1">Arquivo JSON:</Label>
                        <Input 
                          id="file-json" 
                          type="file" 
                          accept=".json"
                          ref={fileInputJsonRef}
                          onChange={handleImportJson}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="file-csv" className="block mb-1">Arquivo CSV:</Label>
                        <Input 
                          id="file-csv" 
                          type="file" 
                          accept=".csv"
                          ref={fileInputCsvRef}
                          onChange={handleImportCsv}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 mt-2">
                      Importe um backup JSON ou CSV para recuperar seus dados. Esta é a única maneira de preservar
                      seus dados entre sessões no modo sem cookies.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}