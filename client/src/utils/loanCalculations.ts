import { addMonths, addWeeks, differenceInDays, parseISO } from "date-fns";
import { Loan, LoanStatus, Payment, PaymentFrequency } from "@/types";

/**
 * Calculate the total amount due for a loan (principal + interest)
 */
export function calculateTotalDue(
  principal: number,
  interestRate: number,
  months: number
): number {
  const monthlyRate = interestRate / 100;
  let totalInterest = 0;
  let remainingPrincipal = principal;

  for (let i = 0; i < months; i++) {
    const interestForMonth = remainingPrincipal * monthlyRate;
    totalInterest += interestForMonth;
    const principalPayment = principal / months;
    remainingPrincipal -= principalPayment;
  }

  return principal + totalInterest;
}

/**
 * Calculate the installment amount for a loan
 */
export function calculateInstallmentAmount(
  principal: number,
  interestRate: number,
  months: number
): number {
  const totalDue = calculateTotalDue(principal, interestRate, months);
  return totalDue / months;
}

/**
 * Calculate the remaining balance of a loan after payments
 */
export function calculateRemainingBalance(
  loan: Loan,
  payments: Payment[]
): number {
  if (!payments.length) return loan.principal;

  const totalPaidPrincipal = payments.reduce(
    (sum, payment) => sum + payment.principal,
    0
  );
  return loan.principal - totalPaidPrincipal;
}

/**
 * Check if a loan is overdue
 */
export function isLoanOverdue(loan: Loan): boolean {
  if (loan.status === "paid") return false;
  
  const today = new Date();
  const nextPaymentDate = loan.nextPaymentDate ? parseISO(loan.nextPaymentDate) : null;
  
  return nextPaymentDate ? nextPaymentDate < today : false;
}

/**
 * Calculate days overdue for a loan
 */
export function getDaysOverdue(loan: Loan): number {
  if (!isLoanOverdue(loan) || !loan.nextPaymentDate) return 0;
  
  const today = new Date();
  const nextPaymentDate = parseISO(loan.nextPaymentDate);
  
  return differenceInDays(today, nextPaymentDate);
}

/**
 * Calculate days until next payment
 */
export function getDaysUntilDue(loan: Loan): number {
  if (!loan.nextPaymentDate) return 0;
  
  const today = new Date();
  const nextPaymentDate = parseISO(loan.nextPaymentDate);
  
  if (nextPaymentDate < today) return 0;
  
  return differenceInDays(nextPaymentDate, today);
}

/**
 * Calculate the distribution of a payment between principal and interest
 */
export function calculatePaymentDistribution(
  paymentAmount: number,
  remainingPrincipal: number,
  interestRate: number
): { principal: number; interest: number } {
  const monthlyInterestRate = interestRate / 100;
  const interestDue = remainingPrincipal * monthlyInterestRate;
  
  // First pay interest, then principal
  const interest = Math.min(interestDue, paymentAmount);
  const principal = Math.max(0, paymentAmount - interest);
  
  return { principal, interest };
}

/**
 * Calculate the next payment date based on frequency
 */
export function calculateNextPaymentDate(
  currentDate: Date,
  frequency: PaymentFrequency
): Date {
  switch (frequency) {
    case "weekly":
      return addWeeks(currentDate, 1);
    case "biweekly":
      return addWeeks(currentDate, 2);
    case "monthly":
      return addMonths(currentDate, 1);
    case "quarterly":
      return addMonths(currentDate, 3);
    case "yearly":
      return addMonths(currentDate, 12);
    case "custom":
    default:
      return addMonths(currentDate, 1); // Default to monthly
  }
}

/**
 * Determine new loan status based on payments and dates
 */
export function determineNewLoanStatus(
  loan: Loan,
  payments: Payment[]
): LoanStatus {
  const remainingBalance = calculateRemainingBalance(loan, payments);
  
  // If fully paid
  if (remainingBalance <= 0) {
    return "paid";
  }
  
  // Check if overdue
  const daysOverdue = getDaysOverdue(loan);
  
  if (daysOverdue > 90) {
    return "defaulted";
  } else if (daysOverdue > 0) {
    return "overdue";
  } else {
    return "active";
  }
}

/**
 * Calculate loan metrics for dashboard
 */
export function calculateLoanMetrics(
  loans: Loan[],
  payments: Payment[]
): {
  totalLent: number;
  totalInterest: number;
  totalOverdue: number;
  totalToReceive: number;
  activeLoans: number;
  paidLoans: number;
  overdueLoans: number;
  defaultedLoans: number;
} {
  // Total lent (sum of all loan principals)
  const totalLent = loans.reduce((sum, loan) => sum + loan.principal, 0);
  
  // Total interest paid
  const totalInterestPaid = payments.reduce(
    (sum, payment) => sum + payment.interest,
    0
  );
  
  // Calculate remaining balances and overdue amounts
  let totalOverdue = 0;
  let totalToReceive = 0;
  
  loans.forEach(loan => {
    const loanPayments = payments.filter(payment => payment.loanId === loan.id);
    const remainingBalance = calculateRemainingBalance(loan, loanPayments);
    
    if (loan.status === "overdue" || loan.status === "defaulted") {
      totalOverdue += remainingBalance;
    }
    
    if (loan.status !== "paid") {
      totalToReceive += remainingBalance;
    }
  });
  
  // Count loans by status
  const activeLoans = loans.filter(loan => loan.status === "active").length;
  const paidLoans = loans.filter(loan => loan.status === "paid").length;
  const overdueLoans = loans.filter(loan => loan.status === "overdue").length;
  const defaultedLoans = loans.filter(loan => loan.status === "defaulted").length;
  
  return {
    totalLent,
    totalInterest: totalInterestPaid,
    totalOverdue,
    totalToReceive,
    activeLoans,
    paidLoans,
    overdueLoans,
    defaultedLoans
  };
}
