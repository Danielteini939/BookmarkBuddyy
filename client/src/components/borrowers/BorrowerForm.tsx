import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Borrower } from "@/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Form schema
const borrowerFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type BorrowerFormValues = z.infer<typeof borrowerFormSchema>;

interface BorrowerFormProps {
  borrower?: Borrower;
  onSubmit: (data: BorrowerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const BorrowerForm: React.FC<BorrowerFormProps> = ({
  borrower,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerFormSchema),
    defaultValues: {
      name: borrower?.name || "",
      email: borrower?.email || "",
      phone: borrower?.phone || "",
    },
  });

  const isEditMode = !!borrower;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Editar Mutuário" : "Novo Mutuário"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome completo do mutuário
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email para contato (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Telefone para contato (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

export default BorrowerForm;
