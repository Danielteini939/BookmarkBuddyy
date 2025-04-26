import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Download, Upload, Save } from "lucide-react";
import { downloadCSV } from "@/utils/csvHelpers";

// Form schema
const settingsFormSchema = z.object({
  defaultInterestRate: z.coerce.number().min(0, "Taxa deve ser maior ou igual a zero"),
  defaultPaymentFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly", "custom"] as const),
  defaultInstallments: z.coerce.number().int().positive("Número de parcelas deve ser positivo"),
  currency: z.string().min(1, "Moeda não pode estar vazia"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData } = useLoan();

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
  };

  // Handler for exporting data
  const handleExport = () => {
    const csvData = exportData();
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csvData, `loanbuddy_export_${date}.csv`);
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="general" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Gerais</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
