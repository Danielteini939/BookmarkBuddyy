import { LoanType, PaymentType, LoanStatus } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

/**
 * Calculate the total amount due for a loan (principal + interest)
 */
export function calculateTotalDue(loan: LoanType): number {
  const interestAmount = (loan.principal * loan.interestRate) / 100;
  return loan.principal + interestAmount;
}

/**
 * Calculate the remaining balance of a loan after payments
 */
export function calculateRemainingBalance(loan: LoanType, payments: PaymentType[]): number {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalDue = calculateTotalDue(loan);
  return Math.max(0, totalDue - totalPaid);
}

/**
 * Check if a loan is overdue
 */
export function isLoanOverdue(loan: LoanType): boolean {
  const today = new Date();
  const dueDate = parseISO(loan.dueDate);
  return today > dueDate;
}

/**
 * Calculate the number of days a loan is overdue
 */
export function getDaysOverdue(loan: LoanType): number {
  if (!isLoanOverdue(loan)) return 0;
  
  const today = new Date();
  const dueDate = parseISO(loan.dueDate);
  return differenceInDays(today, dueDate);
}

/**
 * Distribute a payment amount between principal and interest
 */
export function calculatePaymentDistribution(
  loan: LoanType,
  paymentAmount: number,
  previousPayments: PaymentType[]
): { principal: number; interest: number } {
  // Calculate total paid so far
  const totalPaidSoFar = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate total interest for the loan
  const totalInterest = (loan.principal * loan.interestRate) / 100;
  
  // Calculate interest paid so far
  const interestPaidSoFar = previousPayments.reduce((sum, payment) => sum + payment.interest, 0);
  
  // Calculate remaining interest to be paid
  const remainingInterest = Math.max(0, totalInterest - interestPaidSoFar);
  
  // If payment exceeds remaining interest, allocate accordingly
  if (paymentAmount >= remainingInterest) {
    return {
      interest: remainingInterest,
      principal: paymentAmount - remainingInterest,
    };
  }
  
  // Otherwise, all goes to interest
  return {
    interest: paymentAmount,
    principal: 0,
  };
}

/**
 * Determine the new status of a loan based on payments and dates
 */
export function determineNewLoanStatus(loan: LoanType, payments: PaymentType[]): LoanStatus {
  const remainingBalance = calculateRemainingBalance(loan, payments);
  
  // If fully paid, return 'paid' status
  if (remainingBalance <= 0) {
    return 'paid';
  }
  
  // Check if loan is overdue
  const daysOverdue = getDaysOverdue(loan);
  
  if (daysOverdue > 90) {
    return 'defaulted';
  }
  
  if (daysOverdue > 0) {
    return 'overdue';
  }
  
  return 'active';
}

/**
 * Calculate the monthly payment amount for a loan
 */
export function calculateMonthlyPayment(principal: number, interestRate: number, months: number): number {
  // Convert annual interest rate to monthly rate
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate payment using the formula for EMI
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  
  return payment;
}
