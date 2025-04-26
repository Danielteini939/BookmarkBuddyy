import { BorrowerType, LoanType, PaymentType } from "@/types";

/**
 * Parse a CSV string into structured data
 */
export function parseCSV(csvData: string): {
  importedBorrowers: BorrowerType[];
  importedLoans: LoanType[];
  importedPayments: PaymentType[];
} {
  const lines = csvData.split('\n');
  
  // Identify sections
  const borrowerSectionStart = lines.findIndex(line => line.trim() === '[BORROWERS]') + 1;
  const loanSectionStart = lines.findIndex(line => line.trim() === '[LOANS]') + 1;
  const paymentSectionStart = lines.findIndex(line => line.trim() === '[PAYMENTS]') + 1;
  
  const borrowerSectionEnd = loanSectionStart - 2;
  const loanSectionEnd = paymentSectionStart - 2;
  
  // Parse borrowers
  const borrowerLines = lines.slice(borrowerSectionStart, borrowerSectionEnd);
  const borrowerHeaders = borrowerLines[0].split(',').map(header => header.trim());
  const borrowerData = borrowerLines.slice(1);
  
  const importedBorrowers: BorrowerType[] = borrowerData.map(line => {
    const values = line.split(',').map(val => val.trim());
    const borrower: any = {};
    
    borrowerHeaders.forEach((header, index) => {
      borrower[header] = values[index];
    });
    
    return {
      id: borrower.id,
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone
    };
  }).filter(borrower => borrower.id);
  
  // Parse loans
  const loanLines = lines.slice(loanSectionStart, loanSectionEnd);
  const loanHeaders = loanLines[0].split(',').map(header => header.trim());
  const loanData = loanLines.slice(1);
  
  const importedLoans: LoanType[] = loanData.map(line => {
    const values = line.split(',').map(val => val.trim());
    const loan: any = {};
    
    loanHeaders.forEach((header, index) => {
      if (header === 'principal' || header === 'interestRate') {
        loan[header] = parseFloat(values[index]);
      } else {
        loan[header] = values[index];
      }
    });
    
    return {
      id: loan.id,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      principal: loan.principal,
      interestRate: loan.interestRate,
      issueDate: loan.issueDate,
      dueDate: loan.dueDate,
      status: loan.status,
      notes: loan.notes,
      paymentSchedule: loan.paymentSchedule ? JSON.parse(loan.paymentSchedule) : undefined
    };
  }).filter(loan => loan.id);
  
  // Parse payments
  const paymentLines = lines.slice(paymentSectionStart);
  const paymentHeaders = paymentLines[0].split(',').map(header => header.trim());
  const paymentData = paymentLines.slice(1);
  
  const importedPayments: PaymentType[] = paymentData.map(line => {
    const values = line.split(',').map(val => val.trim());
    const payment: any = {};
    
    paymentHeaders.forEach((header, index) => {
      if (header === 'amount' || header === 'principal' || header === 'interest') {
        payment[header] = parseFloat(values[index]);
      } else {
        payment[header] = values[index];
      }
    });
    
    return {
      id: payment.id,
      loanId: payment.loanId,
      date: payment.date,
      amount: payment.amount,
      principal: payment.principal,
      interest: payment.interest,
      notes: payment.notes
    };
  }).filter(payment => payment.id);
  
  return {
    importedBorrowers,
    importedLoans,
    importedPayments
  };
}

/**
 * Generate a CSV string from application data
 */
export function generateCSV(
  borrowers: BorrowerType[],
  loans: LoanType[],
  payments: PaymentType[]
): string {
  // Borrower section
  let csv = '[BORROWERS]\n';
  csv += 'id,name,email,phone\n';
  
  borrowers.forEach(borrower => {
    csv += `${borrower.id},${borrower.name},${borrower.email || ''},${borrower.phone || ''}\n`;
  });
  
  // Loan section
  csv += '\n[LOANS]\n';
  csv += 'id,borrowerId,borrowerName,principal,interestRate,issueDate,dueDate,status,notes,paymentSchedule\n';
  
  loans.forEach(loan => {
    const paymentScheduleString = loan.paymentSchedule 
      ? JSON.stringify(loan.paymentSchedule).replace(/"/g, '""') 
      : '';
    
    csv += `${loan.id},${loan.borrowerId},${loan.borrowerName},${loan.principal},${loan.interestRate},${loan.issueDate},${loan.dueDate},${loan.status},${loan.notes || ''},"${paymentScheduleString}"\n`;
  });
  
  // Payment section
  csv += '\n[PAYMENTS]\n';
  csv += 'id,loanId,date,amount,principal,interest,notes\n';
  
  payments.forEach(payment => {
    csv += `${payment.id},${payment.loanId},${payment.date},${payment.amount},${payment.principal},${payment.interest},${payment.notes || ''}\n`;
  });
  
  return csv;
}

/**
 * Download a string as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create download URL
  const url = URL.createObjectURL(blob);
  
  // Setup download link
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link, trigger download, and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
