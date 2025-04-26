import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoan } from "@/context/LoanContext";
import { calculatePaymentDistribution } from "@/utils/loanCalculations";
import { format } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

// Form schema
const paymentFormSchema = z.object({
  date: z.date(),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  loanId: string;
  onComplete?: () => void;
}

export default function PaymentForm({ loanId, onComplete }: PaymentFormProps) {
  const { getLoanById, getPaymentsByLoanId, addPayment } = useLoan();
  const [principal, setPrincipal] = useState(0);
  const [interest, setInterest] = useState(0);

  const loan = getLoanById(loanId);
  const previousPayments = getPaymentsByLoanId(loanId);

  // Set up form with default values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      date: new Date(),
      amount: loan?.paymentSchedule?.installmentAmount || 0,
      notes: "",
    },
  });

  // Calculate payment distribution when amount changes
  const amount = form.watch("amount");
  
  useEffect(() => {
    if (loan && amount > 0) {
      const { principal: principalAmount, interest: interestAmount } = 
        calculatePaymentDistribution(loan, amount, previousPayments);
      
      setPrincipal(principalAmount);
      setInterest(interestAmount);
    } else {
      setPrincipal(0);
      setInterest(0);
    }
  }, [loan, amount, previousPayments]);

  const onSubmit = (data: PaymentFormValues) => {
    if (!loan) return;
    
    addPayment({
      loanId: loan.id,
      date: format(data.date, "yyyy-MM-dd"),
      amount: data.amount,
      principal: principal,
      interest: interest,
      notes: data.notes,
    });
    
    if (onComplete) {
      onComplete();
    }
  };

  if (!loan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Empréstimo não encontrado</h3>
            <p className="mt-2 text-slate-500">
              O empréstimo solicitado não existe ou foi removido.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Pagamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={"w-full pl-3 text-left font-normal flex justify-between items-center"}
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
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pagamento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor sugerido: {formatCurrency(loan.paymentSchedule?.installmentAmount || 0)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Principal</h3>
                <div className="p-3 bg-slate-50 rounded-md">
                  {formatCurrency(principal)}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Juros</h3>
                <div className="p-3 bg-slate-50 rounded-md">
                  {formatCurrency(interest)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o pagamento"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onComplete}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
