import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Save, RotateCcw, History, AlertCircle, Clock, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { downloadCSV } from "@/utils/csvHelpers";
import { 
  createBackup, 
  downloadBackup, 
  validateBackup, 
  saveAutoBackup, 
  getAutoBackupsList, 
  restoreFromAutoBackup,
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
  
  // Estado para backups automáticos
  const [autoBackupsList, setAutoBackupsList] = useState<{ key: string; timestamp: Date; description: string }[]>([]);
  const [enableAutoBackup, setEnableAutoBackup] = useState<boolean>(false);
  const [backupDescription, setBackupDescription] = useState<string>("");
  const [selectedBackupKey, setSelectedBackupKey] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupInterval, setBackupInterval] = useState<string>("daily");
  const [showJsonImport, setShowJsonImport] = useState<boolean>(false);
  const [jsonImportErrors, setJsonImportErrors] = useState<string[]>([]);
  
  // Carregar lista de backups automáticos no carregamento da página
  useEffect(() => {
    const backups = getAutoBackupsList();
    setAutoBackupsList(backups);
    
    // Verificar se o backup automático está habilitado
    const autoBackupEnabled = localStorage.getItem('loanbuddy_auto_backup_enabled');
    setEnableAutoBackup(autoBackupEnabled === 'true');
    
    // Carregar intervalo de backup
    const interval = localStorage.getItem('loanbuddy_auto_backup_interval');
    if (interval) {
      setBackupInterval(interval);
    }
  }, []);
  
  // Atualizar configuração de backup automático
  useEffect(() => {
    localStorage.setItem('loanbuddy_auto_backup_enabled', enableAutoBackup.toString());
    
    // Configurar intervalo de backup automático se habilitado
    if (enableAutoBackup) {
      saveAutoBackup(borrowers, loans, payments, settings);
      toast({
        title: "Backup automático configurado",
        description: `Os dados serão salvos ${backupInterval === 'daily' ? 'diariamente' : 
                      backupInterval === 'weekly' ? 'semanalmente' : 
                      'mensalmente'}.`,
      });
    }
  }, [enableAutoBackup, backupInterval]);
  
  // Atualizar intervalo de backup
  useEffect(() => {
    localStorage.setItem('loanbuddy_auto_backup_interval', backupInterval);
  }, [backupInterval]);

  // Set up form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      defaultInterestRate: settings.defaultInterestRate,
      defaultPaymentFrequency: settings.defaultPaymentFrequency,
      defaultInstallments: settings.defaultInstallments,
      currency: settings.currency,
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  // Handler para exportar CSV (formato compatível)
  const handleExport = () => {
    const csvData = exportData();
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csvData, `loanbuddy_export_${date}.csv`);
    
    toast({
      title: "Dados exportados",
      description: "Os dados foram exportados com sucesso em formato CSV.",
    });
  };
  
  // Handler para exportar backup em JSON
  const handleBackupExport = () => {
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
        description: "O backup foi criado e baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      toast({
        title: "Erro ao criar backup",
        description: "Ocorreu um erro ao criar o backup. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupDescription("");
    }
  };

  // Handler para importação de CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            description: "Os dados foram importados com sucesso do arquivo CSV.",
          });
          
          // Atualizar lista de backups depois de importar
          setAutoBackupsList(getAutoBackupsList());
        } catch (error) {
          console.error("Erro na importação:", error);
          toast({
            title: "Erro na importação",
            description: error instanceof Error ? error.message : "Erro desconhecido na importação de dados",
            variant: "destructive",
          });
        }
      }
    };
    reader.readAsText(file);
  };
  
  // Handler para importação de JSON
  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          setJsonImportErrors(validation.errors);
          setShowJsonImport(true);
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
          description: "Os dados foram restaurados com sucesso do arquivo de backup.",
        });
        
        // Atualizar lista de backups depois de importar
        setAutoBackupsList(getAutoBackupsList());
      } catch (error) {
        console.error("Erro ao processar arquivo JSON:", error);
        toast({
          title: "Erro na importação",
          description: "O arquivo não contém um backup válido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };
  
  // Restaurar de um backup automático
  const handleRestoreFromAutoBackup = () => {
    if (!selectedBackupKey) return;
    
    try {
      const backupData = restoreFromAutoBackup(selectedBackupKey);
      if (!backupData) {
        throw new Error("Backup não encontrado ou inválido");
      }
      
      // Restaurar dados
      importData(JSON.stringify({
        borrowers: backupData.borrowers,
        loans: backupData.loans,
        payments: backupData.payments
      }));
      
      // Restaurar configurações
      updateSettings(backupData.settings);
      
      toast({
        title: "Ponto de restauração aplicado",
        description: "Os dados foram restaurados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      toast({
        title: "Erro na restauração",
        description: "Não foi possível restaurar o backup selecionado.",
        variant: "destructive",
      });
    } finally {
      setSelectedBackupKey(null);
      setShowRestoreConfirm(false);
    }
  };
  
  // Criar um backup manual
  const handleManualBackup = () => {
    try {
      saveAutoBackup(borrowers, loans, payments, settings);
      
      // Atualizar lista de backups
      setAutoBackupsList(getAutoBackupsList());
      
      toast({
        title: "Ponto de restauração criado",
        description: "Um novo ponto de restauração foi criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar ponto de restauração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ponto de restauração.",
        variant: "destructive",
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
                Exporte ou importe dados do sistema para backup ou migração.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Exportar Dados</h3>
                <p className="text-slate-500 mb-4">
                  Exporte todos os dados do sistema para um arquivo CSV. 
                  Isso inclui mutuários, empréstimos e pagamentos.
                </p>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Importar Dados</h3>
                <p className="text-slate-500 mb-4">
                  Importe dados de um arquivo CSV exportado anteriormente. 
                  <span className="font-bold text-amber-600"> Atenção: isso substituirá todos os dados atuais!</span>
                </p>
                <Button variant="outline">
                  <label className="flex items-center cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
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
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h3 className="text-sm font-semibold mb-1">Nota Importante:</h3>
              <p className="text-xs text-slate-500">
                A importação de dados irá substituir todos os dados existentes no sistema. Certifique-se de fazer um backup antes de importar novos dados.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>
                Crie pontos de restauração dos seus dados e restaure-os quando necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pontos de Restauração Automáticos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Pontos de Restauração</h3>
                  <Button size="sm" onClick={handleManualBackup}>
                    <Database className="h-4 w-4 mr-2" />
                    Criar Ponto de Restauração
                  </Button>
                </div>
                <p className="text-slate-500 mb-4">
                  Pontos de restauração permitem recuperar seus dados para um estado anterior.
                </p>
                
                {autoBackupsList.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {autoBackupsList.map((backup) => (
                          <TableRow key={backup.key}>
                            <TableCell>
                              {backup.timestamp.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>{backup.description}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBackupKey(backup.key);
                                  setShowRestoreConfirm(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md bg-slate-50">
                    <p className="text-slate-500">
                      Nenhum ponto de restauração disponível.
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Backup Automático */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Backup Automático</h3>
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">Habilitar backup automático</div>
                    <div className="text-sm text-slate-500">
                      Cria pontos de restauração automaticamente de acordo com o intervalo selecionado
                    </div>
                  </div>
                  <Switch
                    checked={enableAutoBackup}
                    onCheckedChange={setEnableAutoBackup}
                  />
                </div>
                
                {enableAutoBackup && (
                  <div className="mt-4 flex flex-col space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="backup-interval">Intervalo de Backup</Label>
                      <Select
                        value={backupInterval}
                        onValueChange={setBackupInterval}
                      >
                        <SelectTrigger id="backup-interval">
                          <SelectValue placeholder="Selecione o intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Backup e Restauração Manual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Backup Completo</h3>
                  <p className="text-slate-500 mb-4">
                    Faça o download de um arquivo de backup completo de todos os seus dados para armazenamento externo.
                  </p>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="backup-description">Descrição (opcional)</Label>
                      <Input
                        id="backup-description"
                        placeholder="Backup mensal - Abril/2025"
                        value={backupDescription}
                        onChange={(e) => setBackupDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleBackupExport} disabled={isCreatingBackup}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Backup JSON
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Restaurar Backup</h3>
                  <p className="text-slate-500 mb-4">
                    Restaure seus dados a partir de um arquivo de backup JSON.
                    <span className="font-bold text-amber-600"> Atenção: isso substituirá todos os dados atuais!</span>
                  </p>
                  <Button variant="outline">
                    <label className="flex items-center cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Backup JSON
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleJsonImport}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start bg-slate-50">
              <Alert className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informação importante</AlertTitle>
                <AlertDescription>
                  Seus dados são armazenados localmente no seu navegador. Recomendamos fazer backups regulares para evitar perda de dados.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de confirmação de restauração */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar dados</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar seus dados para este ponto de restauração?
              Todos os dados atuais serão substituídos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Esta ação não pode ser desfeita. Todos os dados atuais serão perdidos.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRestoreFromAutoBackup}
            >
              Sim, restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de erro de importação */}
      <Dialog open={showJsonImport} onOpenChange={setShowJsonImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro na importação</DialogTitle>
            <DialogDescription>
              O arquivo de backup contém erros e não pode ser importado:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[300px] overflow-y-auto">
            <ul className="list-disc pl-5 space-y-1">
              {jsonImportErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">{error}</li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowJsonImport(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
