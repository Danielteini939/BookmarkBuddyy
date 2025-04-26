import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, PaymentFrequency } from "@/types";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Form schema
const settingsFormSchema = z.object({
  defaultInterestRate: z
    .string()
    .min(1, "Informe a taxa de juros padrão")
    .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
      message: "Taxa de juros deve ser um número positivo",
    }),
  defaultFrequency: z.string().min(1, "Selecione a frequência padrão"),
  defaultInstallments: z
    .string()
    .min(1, "Informe o número de parcelas padrão")
    .refine((value) => !isNaN(parseInt(value)) && parseInt(value) > 0, {
      message: "Número de parcelas deve ser maior que zero",
    }),
  currency: z.string().min(1, "Informe o símbolo da moeda"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  settings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
  isSubmitting: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      defaultInterestRate: settings?.defaultInterestRate.toString() || "2.0",
      defaultFrequency: settings?.defaultFrequency || "monthly",
      defaultInstallments: settings?.defaultInstallments.toString() || "12",
      currency: settings?.currency || "R$",
    },
  });

  const handleSubmitForm = (data: SettingsFormValues) => {
    const formattedData = {
      defaultInterestRate: parseFloat(data.defaultInterestRate),
      defaultFrequency: data.defaultFrequency as PaymentFrequency,
      defaultInstallments: parseInt(data.defaultInstallments),
      currency: data.currency,
    };

    onSubmit(formattedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>
          Defina as configurações padrão para empréstimos e o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="defaultInterestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Juros Padrão (%)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Taxa de juros mensal padrão para novos empréstimos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência de Pagamento Padrão</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
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
                      Frequência de pagamento padrão para novos empréstimos
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
                        placeholder="12"
                        type="number"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Número padrão de parcelas para novos empréstimos
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
                    <FormLabel>Símbolo da Moeda</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Símbolo da moeda utilizado em todo o sistema
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsForm;
