import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loan } from "@/types";
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
import { calculatePaymentDistribution } from "@/utils/loanCalculations";
import { formatCurrency } from "@/utils/formatters";

// Form schema
const paymentFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Informe o valor do pagamento")
    .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
      message: "O valor deve ser maior que zero",
    }),
  principal: z.string(),
  interest: z.string(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  loan: Loan;
  remainingBalance: number;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  loan,
  remainingBalance,
  onSubmit,
  isSubmitting,
}) => {
  const [suggestedAmount, setSuggestedAmount] = useState(loan.installmentAmount || 0);

  // Default amount should be the installment amount or the remaining balance,
  // whichever is smaller
  const defaultAmount = Math.min(suggestedAmount, remainingBalance).toFixed(2);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: defaultAmount,
      principal: "0",
      interest: "0",
      notes: "",
    },
  });

  // Calculate principal and interest distribution when amount changes
  useEffect(() => {
    const amount = parseFloat(form.watch("amount") || "0");
    
    if (amount > 0) {
      const { principal, interest } = calculatePaymentDistribution(
        amount,
        remainingBalance,
        loan.interestRate
      );
      
      form.setValue("principal", principal.toFixed(2));
      form.setValue("interest", interest.toFixed(2));
    }
  }, [form.watch("amount"), remainingBalance, loan.interestRate]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingBalance}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Saldo restante: {formatCurrency(remainingBalance)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="principal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Principal</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juros</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
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
                  placeholder="Observações sobre o pagamento (opcional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processando..." : "Registrar Pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;
