export interface Borrower {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export type LoanStatus = 'active' | 'paid' | 'overdue' | 'defaulted';

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface PaymentSchedule {
  frequency: PaymentFrequency;
  nextPaymentDate: string;
  installments: number;
  installmentAmount: number;
}

export interface Loan {
  id: number;
  borrowerId: number;
  principal: number;
  interestRate: number;
  issueDate: string;
  dueDate: string;
  status: LoanStatus;
  notes?: string;
  frequency: PaymentFrequency;
  nextPaymentDate?: string;
  installments?: number;
  installmentAmount?: number;
}

export interface Payment {
  id: number;
  loanId: number;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  notes?: string;
}

export interface Settings {
  id: number;
  defaultInterestRate: number;
  defaultFrequency: PaymentFrequency;
  defaultInstallments: number;
  currency: string;
}

export interface LoanWithBorrower extends Loan {
  borrowerName: string;
}

export interface DashboardMetrics {
  totalLent: number;
  totalInterest: number;
  totalOverdue: number;
  totalToReceive: number;
  totalLoans: number;
  totalBorrowers: number;
  loanStatusDistribution: {
    active: number;
    paid: number;
    overdue: number;
    defaulted: number;
  };
}

export interface UpcomingPayment {
  id: number;
  borrowerName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  loanId: number;
}

export interface OverdueLoan {
  id: number;
  borrowerName: string;
  borrowerEmail?: string;
  principal: number;
  installmentAmount: number;
  dueDate: string;
  daysOverdue: number;
  status: LoanStatus;
}

export interface CSVExportData {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
}
