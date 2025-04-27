import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  BorrowerType,
  LoanType,
  PaymentType,
  DashboardMetrics,
  AppSettings,
  LoanStatus
} from "@/types";
import { formatDate } from "@/utils/formatters";
import { parseISO } from "date-fns";

// Interface do contexto de empréstimos
interface LoanContextType {
  // Dados
  borrowers: BorrowerType[];
  loans: LoanType[];
  payments: PaymentType[];
  settings: AppSettings;
  
  // Operações de Mutuários
  addBorrower: (borrower: Omit<BorrowerType, "id">) => void;
  updateBorrower: (id: string, borrower: Partial<BorrowerType>) => void;
  deleteBorrower: (id: string) => void;
  getBorrowerById: (id: string) => BorrowerType | undefined;
  
  // Operações de Empréstimos
  addLoan: (loan: Omit<LoanType, "id" | "status" | "borrowerName">) => void;
  updateLoan: (id: string, loan: Partial<LoanType>) => void;
  deleteLoan: (id: string) => void;
  getLoanById: (id: string) => LoanType | undefined;
  getLoansByBorrowerId: (borrowerId: string) => LoanType[];
  
  // Operações de Pagamentos
  addPayment: (payment: Omit<PaymentType, "id">) => void;
  updatePayment: (id: string, payment: Partial<PaymentType>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByLoanId: (loanId: string) => PaymentType[];
  
  // Cálculos e Análises
  calculateLoanMetrics: (loanId: string) => {
    totalPrincipal: number;
    totalInterest: number;
    totalPaid: number;
    remainingBalance: number;
  };
  getDashboardMetrics: () => DashboardMetrics;
  getOverdueLoans: () => LoanType[];
  getUpcomingDueLoans: (days: number) => LoanType[];
  
  // Configurações
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Importação/Exportação
  importData: (data: any) => void;
  exportData: () => any;
}

// Configurações padrão do aplicativo
const initialSettings: AppSettings = {
  defaultInterestRate: 5,
  defaultPaymentFrequency: 'monthly',
  defaultInstallments: 12,
  currency: 'BRL'
};

// Criação do contexto
const LoanContext = createContext<LoanContextType | undefined>(undefined);

// Provedor do contexto
export const LoanProvider = ({ children }: { children: ReactNode }) => {
  // Estados para armazenar dados
  const [borrowers, setBorrowers] = useState<BorrowerType[]>([]);
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  // Funções de gestão de mutuários
  const addBorrower = (borrower: Omit<BorrowerType, "id">) => {
    const newBorrower: BorrowerType = {
      ...borrower,
      id: Math.random().toString(36).substring(2, 9)
    };
    setBorrowers(prev => [...prev, newBorrower]);
  };

  const updateBorrower = (id: string, borrower: Partial<BorrowerType>) => {
    setBorrowers(prev => 
      prev.map(b => b.id === id ? { ...b, ...borrower } : b)
    );
  };

  const deleteBorrower = (id: string) => {
    setBorrowers(prev => prev.filter(b => b.id !== id));
  };

  const getBorrowerById = (id: string) => {
    return borrowers.find(b => b.id === id);
  };

  // Funções de gestão de empréstimos
  const addLoan = (loan: Omit<LoanType, "id" | "status" | "borrowerName">) => {
    const borrower = borrowers.find(b => b.id === loan.borrowerId);
    const borrowerName = borrower ? borrower.name : "Desconhecido";
    
    const newLoan: LoanType = {
      ...loan,
      id: Math.random().toString(36).substring(2, 9),
      status: 'active',
      borrowerName
    };
    
    setLoans(prev => [...prev, newLoan]);
  };

  const updateLoan = (id: string, loan: Partial<LoanType>) => {
    // Se o borrowerId mudou, atualize também o borrowerName
    if (loan.borrowerId) {
      const borrower = borrowers.find(b => b.id === loan.borrowerId);
      if (borrower) {
        loan.borrowerName = borrower.name;
      }
    }
    
    setLoans(prev => 
      prev.map(l => l.id === id ? { ...l, ...loan } : l)
    );
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  const getLoanById = (id: string) => {
    return loans.find(l => l.id === id);
  };

  const getLoansByBorrowerId = (borrowerId: string) => {
    return loans.filter(l => l.borrowerId === borrowerId);
  };

  // Funções de gestão de pagamentos
  const addPayment = (payment: Omit<PaymentType, "id">) => {
    const newPayment: PaymentType = {
      ...payment,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, payment: Partial<PaymentType>) => {
    setPayments(prev => 
      prev.map(p => p.id === id ? { ...p, ...payment } : p)
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const getPaymentsByLoanId = (loanId: string) => {
    return payments.filter(p => p.loanId === loanId);
  };

  // Cálculos e métricas
  const calculateLoanMetrics = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    const loanPayments = payments.filter(p => p.loanId === loanId);
    
    const totalPrincipal = loan ? loan.principal : 0;
    const totalInterest = loan ? (loan.principal * loan.interestRate / 100) : 0;
    const totalPaid = loanPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingBalance = (totalPrincipal + totalInterest) - totalPaid;
    
    return {
      totalPrincipal,
      totalInterest,
      totalPaid,
      remainingBalance
    };
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const activeLoans = loans.filter(l => l.status === 'active');
    const paidLoans = loans.filter(l => l.status === 'paid');
    const overdueLoans = loans.filter(l => l.status === 'overdue');
    const defaultedLoans = loans.filter(l => l.status === 'defaulted');
    
    const totalLoaned = loans.reduce((acc, l) => acc + l.principal, 0);
    const totalInterestAccrued = loans.reduce((acc, l) => acc + (l.principal * l.interestRate / 100), 0);
    const totalOverdue = overdueLoans.reduce((acc, l) => acc + l.principal, 0);
    
    // Cálculo do total recebido neste mês
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const totalReceivedThisMonth = payments
      .filter(p => {
        const paymentDate = parseISO(p.date);
        return paymentDate >= firstDayOfMonth && paymentDate <= today;
      })
      .reduce((acc, p) => acc + p.amount, 0);
    
    return {
      totalLoaned,
      totalInterestAccrued,
      totalOverdue,
      totalBorrowers: borrowers.length,
      activeLoanCount: activeLoans.length,
      paidLoanCount: paidLoans.length,
      overdueLoanCount: overdueLoans.length,
      defaultedLoanCount: defaultedLoans.length,
      totalReceivedThisMonth,
    };
  };

  const getOverdueLoans = () => {
    return loans.filter(l => l.status === 'overdue');
  };

  const getUpcomingDueLoans = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return loans.filter(l => {
      if (l.status !== 'active') return false;
      
      const dueDate = parseISO(l.dueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  };

  // Configurações
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Importação/Exportação
  const importData = (data: any) => {
    if (data.borrowers) setBorrowers(data.borrowers);
    if (data.loans) setLoans(data.loans);
    if (data.payments) setPayments(data.payments);
    if (data.settings) setSettings(data.settings);
  };

  const exportData = () => {
    return {
      borrowers,
      loans,
      payments,
      settings
    };
  };

  // Adicionar alguns dados de exemplo quando inicializar
  useEffect(() => {
    // Exemplo de mutuário
    const sampleBorrower: BorrowerType = {
      id: "bwr1",
      name: "João Silva",
      email: "joao@example.com",
      phone: "11987654321"
    };
    
    // Exemplo de empréstimo
    const sampleLoan: LoanType = {
      id: "loan1",
      borrowerId: "bwr1",
      borrowerName: "João Silva",
      principal: 5000,
      interestRate: 5,
      issueDate: formatDate(new Date().toISOString()),
      dueDate: formatDate(new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString()),
      status: 'active',
      paymentSchedule: {
        frequency: 'monthly',
        nextPaymentDate: formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()),
        installments: 12,
        installmentAmount: 437.5
      }
    };
    
    // Exemplo de pagamento
    const samplePayment: PaymentType = {
      id: "pay1",
      loanId: "loan1",
      date: formatDate(new Date().toISOString()),
      amount: 437.5,
      principal: 416.67,
      interest: 20.83
    };
    
    setBorrowers([sampleBorrower]);
    setLoans([sampleLoan]);
    setPayments([samplePayment]);
  }, []);

  // Valor do contexto
  const contextValue: LoanContextType = {
    borrowers,
    loans,
    payments,
    settings,
    addBorrower,
    updateBorrower,
    deleteBorrower,
    getBorrowerById,
    addLoan,
    updateLoan,
    deleteLoan,
    getLoanById,
    getLoansByBorrowerId,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByLoanId,
    calculateLoanMetrics,
    getDashboardMetrics,
    getOverdueLoans,
    getUpcomingDueLoans,
    updateSettings,
    importData,
    exportData
  };

  return (
    <LoanContext.Provider value={contextValue}>
      {children}
    </LoanContext.Provider>
  );
};

// Hook para usar o contexto
export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoan must be used within a LoanProvider");
  }
  return context;
};