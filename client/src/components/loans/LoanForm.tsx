import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMonths, format, parse } from "date-fns";
import { Borrower, Loan, PaymentFrequency } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateInstallmentAmount } from "@/utils/loanCalculations";
import { formatCurrency } from "@/utils/formatters";

// Form schema
const loanFormSchema = z.object({
  borrowerId: z.string().min(1, "Selecione um mutuário"),
  principal: z.string().min(1, "Informe o valor do empréstimo"),
  interestRate: z.string().min(1, "Informe a taxa de juros"),
  issueDate: z.date({
    required_error: "Selecione a data de emissão",
  }),
  dueDate: z.date({
    required_error: "Selecione a data de vencimento",
  }),
  frequency: z.string().min(1, "Selecione a frequência de pagamento"),
  installments: z.string().min(1, "Informe o número de parcelas"),
  notes: z.string().optional(),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

interface LoanFormProps {
  loan?: Loan;
  borrowers: Borrower[];
  settings?: {
    defaultInterestRate: number;
    defaultFrequency: PaymentFrequency;
    defaultInstallments: number;
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({
  loan,
  borrowers,
  settings,
  onSubmit,
  isSubmitting,
}) => {
  const [installmentAmount, setInstallmentAmount] = useState<number>(0);

  const defaultValues = {
    borrowerId: loan ? loan.borrowerId.toString() : "",
    principal: loan ? loan.principal.toString() : "",
    interestRate: loan ? loan.interestRate.toString() : settings?.defaultInterestRate.toString() || "2.0",
    issueDate: loan ? new Date(loan.issueDate) : new Date(),
    dueDate: loan ? new Date(loan.dueDate) : addMonths(new Date(), 12),
    frequency: loan ? loan.frequency : settings?.defaultFrequency || "monthly",
    installments: loan ? (loan.installments?.toString() || "12") : settings?.defaultInstallments.toString() || "12",
    notes: loan?.notes || "",
  };

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
  });

  // Calculate installment amount whenever relevant fields change
  useEffect(() => {
    const principal = parseFloat(form.watch("principal") || "0");
    const interestRate = parseFloat(form.watch("interestRate") || "0");
    const installments = parseInt(form.watch("installments") || "0");

    if (principal && interestRate && installments) {
      const amount = calculateInstallmentAmount(principal, interestRate, installments);
      setInstallmentAmount(amount);
    } else {
      setInstallmentAmount(0);
    }
  }, [form.watch("principal"), form.watch("interestRate"), form.watch("installments")]);

  const handleSubmitForm = (data: LoanFormValues) => {
    // Convert string values to numbers
    const formattedData = {
      ...data,
      borrowerId: parseInt(data.borrowerId),
      principal: parseFloat(data.principal),
      interestRate: parseFloat(data.interestRate),
      installments: parseInt(data.installments),
      installmentAmount,
      // For a new loan, the first payment date is typically the same as the issue date
      // plus one payment period
      nextPaymentDate: getNextPaymentDate(data.issueDate, data.frequency as PaymentFrequency),
    };

    onSubmit(formattedData);
  };

  const getNextPaymentDate = (startDate: Date, frequency: PaymentFrequency): string => {
    let nextDate = new Date(startDate);
    
    switch (frequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "biweekly":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case "custom":
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate.toISOString();
  };

  const isEditMode = !!loan;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Editar Empréstimo" : "Novo Empréstimo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="borrowerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mutuário</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um mutuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {borrowers.map((borrower) => (
                          <SelectItem key={borrower.id} value={borrower.id.toString()}>
                            {borrower.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o mutuário para este empréstimo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Principal</FormLabel>
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
                      Valor total do empréstimo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Juros (%)</FormLabel>
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
                      Taxa de juros mensal (%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência de Pagamento</FormLabel>
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
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Frequência dos pagamentos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12"
                        type="number"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Quantidade de parcelas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Emissão</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data em que o empréstimo foi emitido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data final de vencimento do empréstimo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o empréstimo (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {installmentAmount > 0 && (
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <p className="font-medium text-slate-700">Resumo:</p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Valor da Parcela:</span>
                    <p className="font-semibold text-slate-800">{formatCurrency(installmentAmount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Total a Pagar:</span>
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(installmentAmount * parseInt(form.watch("installments") || "0"))}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Juros Total:</span>
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(
                        (installmentAmount * parseInt(form.watch("installments") || "0")) -
                          parseFloat(form.watch("principal") || "0")
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEditMode ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoanForm;
