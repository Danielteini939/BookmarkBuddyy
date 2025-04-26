import { 
  Borrower, 
  Loan, 
  Payment, 
  LoanStatus, 
  PaymentFrequency,
  Settings
} from "../types";

export const mockBorrowers: Borrower[] = [
  { id: 1, name: "João Silva", email: "joao@email.com", phone: "(11) 98765-4321" },
  { id: 2, name: "Maria Oliveira", email: "maria@email.com", phone: "(11) 91234-5678" },
  { id: 3, name: "Carlos Mendes", email: "carlos@email.com", phone: "(11) 92345-6789" },
  { id: 4, name: "Ana Paula", email: "ana@email.com", phone: "(11) 93456-7890" },
  { id: 5, name: "Roberto Lima", email: "roberto@email.com", phone: "(11) 94567-8901" },
  { id: 6, name: "Fernanda Santos", email: "fernanda@email.com", phone: "(11) 95678-9012" },
  { id: 7, name: "Marcos Costa", email: "marcos@email.com", phone: "(11) 96789-0123" },
];

export const mockLoans: Loan[] = [
  {
    id: 1,
    borrowerId: 1,
    principal: 10000,
    interestRate: 2.5,
    issueDate: new Date(2023, 5, 10).toISOString(),
    dueDate: new Date(2024, 5, 10).toISOString(),
    status: "active" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 9, 5).toISOString(),
    installments: 12,
    installmentAmount: 850,
    notes: "Empréstimo para reforma da casa"
  },
  {
    id: 2,
    borrowerId: 2,
    principal: 15000,
    interestRate: 2.0,
    issueDate: new Date(2023, 6, 15).toISOString(),
    dueDate: new Date(2024, 6, 15).toISOString(),
    status: "active" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 9, 8).toISOString(),
    installments: 12,
    installmentAmount: 1200,
    notes: "Empréstimo para compra de carro"
  },
  {
    id: 3,
    borrowerId: 3,
    principal: 5000,
    interestRate: 3.0,
    issueDate: new Date(2023, 7, 20).toISOString(),
    dueDate: new Date(2024, 1, 20).toISOString(),
    status: "active" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 9, 12).toISOString(),
    installments: 6,
    installmentAmount: 850,
    notes: "Empréstimo para tratamento médico"
  },
  {
    id: 4,
    borrowerId: 4,
    principal: 20000,
    interestRate: 1.8,
    issueDate: new Date(2023, 8, 5).toISOString(),
    dueDate: new Date(2025, 8, 5).toISOString(),
    status: "active" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 9, 15).toISOString(),
    installments: 24,
    installmentAmount: 1000,
    notes: "Empréstimo para faculdade"
  },
  {
    id: 5,
    borrowerId: 5,
    principal: 5000,
    interestRate: 2.5,
    issueDate: new Date(2023, 7, 1).toISOString(),
    dueDate: new Date(2024, 1, 1).toISOString(),
    status: "overdue" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 8, 15).toISOString(),
    installments: 6,
    installmentAmount: 575,
    notes: "Empréstimo para compra de equipamentos"
  },
  {
    id: 6,
    borrowerId: 6,
    principal: 8200,
    interestRate: 2.2,
    issueDate: new Date(2023, 6, 1).toISOString(),
    dueDate: new Date(2024, 0, 1).toISOString(),
    status: "defaulted" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 8, 5).toISOString(),
    installments: 6,
    installmentAmount: 920,
    notes: "Empréstimo para viagem"
  },
  {
    id: 7,
    borrowerId: 7,
    principal: 4000,
    interestRate: 2.8,
    issueDate: new Date(2023, 8, 1).toISOString(),
    dueDate: new Date(2024, 2, 1).toISOString(),
    status: "overdue" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: new Date(2023, 8, 20).toISOString(),
    installments: 6,
    installmentAmount: 450,
    notes: "Empréstimo para pagamento de dívidas"
  },
  {
    id: 8,
    borrowerId: 1,
    principal: 3000,
    interestRate: 2.0,
    issueDate: new Date(2023, 3, 10).toISOString(),
    dueDate: new Date(2023, 9, 10).toISOString(),
    status: "paid" as LoanStatus,
    frequency: "monthly" as PaymentFrequency,
    nextPaymentDate: null,
    installments: 6,
    installmentAmount: 520,
    notes: "Empréstimo para compra de celular"
  }
];

export const mockPayments: Payment[] = [
  {
    id: 1,
    loanId: 1,
    date: new Date(2023, 6, 10).toISOString(),
    amount: 850,
    principal: 645,
    interest: 205,
    notes: "Pagamento em dia"
  },
  {
    id: 2,
    loanId: 1,
    date: new Date(2023, 7, 10).toISOString(),
    amount: 850,
    principal: 661,
    interest: 189,
    notes: "Pagamento em dia"
  },
  {
    id: 3,
    loanId: 1,
    date: new Date(2023, 8, 10).toISOString(),
    amount: 850,
    principal: 678,
    interest: 172,
    notes: "Pagamento em dia"
  },
  {
    id: 4,
    loanId: 2,
    date: new Date(2023, 7, 15).toISOString(),
    amount: 1200,
    principal: 950,
    interest: 250,
    notes: "Pagamento em dia"
  },
  {
    id: 5,
    loanId: 2,
    date: new Date(2023, 8, 15).toISOString(),
    amount: 1200,
    principal: 966,
    interest: 234,
    notes: "Pagamento em dia"
  },
  {
    id: 6,
    loanId: 3,
    date: new Date(2023, 8, 20).toISOString(),
    amount: 850,
    principal: 700,
    interest: 150,
    notes: "Pagamento em dia"
  },
  {
    id: 7,
    loanId: 8,
    date: new Date(2023, 4, 10).toISOString(),
    amount: 520,
    principal: 470,
    interest: 50,
    notes: "Pagamento em dia"
  },
  {
    id: 8,
    loanId: 8,
    date: new Date(2023, 5, 10).toISOString(),
    amount: 520,
    principal: 479,
    interest: 41,
    notes: "Pagamento em dia"
  },
  {
    id: 9,
    loanId: 8,
    date: new Date(2023, 6, 10).toISOString(),
    amount: 520,
    principal: 489,
    interest: 31,
    notes: "Pagamento em dia"
  },
  {
    id: 10,
    loanId: 8,
    date: new Date(2023, 7, 10).toISOString(),
    amount: 520,
    principal: 499,
    interest: 21,
    notes: "Pagamento em dia"
  },
  {
    id: 11,
    loanId: 8,
    date: new Date(2023, 8, 10).toISOString(),
    amount: 520,
    principal: 509,
    interest: 11,
    notes: "Pagamento em dia"
  },
  {
    id: 12,
    loanId: 8,
    date: new Date(2023, 9, 10).toISOString(),
    amount: 554,
    principal: 554,
    interest: 0,
    notes: "Pagamento final"
  }
];

export const mockSettings: Settings = {
  id: 1,
  defaultInterestRate: 2.0,
  defaultFrequency: "monthly" as PaymentFrequency,
  defaultInstallments: 12,
  currency: "R$"
};
