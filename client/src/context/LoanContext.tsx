import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  BorrowerType,
  LoanType,
  PaymentType,
  LoanStatus,
  DashboardMetrics,
  AppSettings
} from "@/types";
import { calculateRemainingBalance, determineNewLoanStatus } from "@/utils/loanCalculations";
import { mockBorrowers, mockLoans, mockPayments } from "@/utils/mockData";
import { parseCSV, generateCSV } from "@/utils/csvHelpers";
import { useToast } from "@/hooks/use-toast";
import {
  loadBorrowers,
  loadLoans,
  loadPayments,
  loadSettings,
  saveBorrowers,
  saveLoans,
  savePayments,
  saveSettings,
  generateId
} from "@/lib/localStorageClient";

interface LoanContextType {
  // Data
  borrowers: BorrowerType[];
  loans: LoanType[];
  payments: PaymentType[];
  settings: AppSettings;
  
  // Borrower Operations
  addBorrower: (borrower: Omit<BorrowerType, "id">) => void;
  updateBorrower: (id: string, borrower: Partial<BorrowerType>) => void;
  deleteBorrower: (id: string) => void;
  getBorrowerById: (id: string) => BorrowerType | undefined;
  
  // Loan Operations
  addLoan: (loan: Omit<LoanType, "id" | "status" | "borrowerName">) => void;
  updateLoan: (id: string, loan: Partial<LoanType>) => void;
  deleteLoan: (id: string) => void;
  getLoanById: (id: string) => LoanType | undefined;
  getLoansByBorrowerId: (borrowerId: string) => LoanType[];
  
  // Payment Operations
  addPayment: (payment: Omit<PaymentType, "id">) => void;
  updatePayment: (id: string, payment: Partial<PaymentType>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByLoanId: (loanId: string) => PaymentType[];
  
  // Calculation & Analytics
  calculateLoanMetrics: (loanId: string) => {
    totalPrincipal: number;
    totalInterest: number;
    totalPaid: number;
    remainingBalance: number;
  };
  getDashboardMetrics: () => DashboardMetrics;
  getOverdueLoans: () => LoanType[];
  getUpcomingDueLoans: (days: number) => LoanType[];
  
  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Import/Export
  importData: (csvData: string) => void;
  exportData: () => string;
}

const initialSettings: AppSettings = {
  defaultInterestRate: 5,
  defaultPaymentFrequency: "monthly",
  defaultInstallments: 12,
  currency: "R$"
};

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar com dados do localStorage ou dados mockados
  const [borrowers, setBorrowers] = useState<BorrowerType[]>(() => {
    const storedBorrowers = loadBorrowers();
    return storedBorrowers.length > 0 ? storedBorrowers : mockBorrowers;
  });
  
  const [loans, setLoans] = useState<LoanType[]>(() => {
    const storedLoans = loadLoans();
    return storedLoans.length > 0 ? storedLoans : mockLoans;
  });
  
  const [payments, setPayments] = useState<PaymentType[]>(() => {
    const storedPayments = loadPayments();
    return storedPayments.length > 0 ? storedPayments : mockPayments;
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const storedSettings = loadSettings();
    return storedSettings || initialSettings;
  });
  
  const { toast } = useToast();
  
  // Salvar dados no localStorage sempre que mudar
  useEffect(() => {
    saveBorrowers(borrowers);
  }, [borrowers]);
  
  useEffect(() => {
    saveLoans(loans);
  }, [loans]);
  
  useEffect(() => {
    savePayments(payments);
  }, [payments]);
  
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);
  
  // Update loan statuses based on due dates and payments
  useEffect(() => {
    // Usar nossa função utilitária para determinar o status do empréstimo
    const updatedLoans = loans.map(loan => {      
      // Obter os pagamentos deste empréstimo
      const loanPayments = payments.filter(payment => payment.loanId === loan.id);
      
      // Determinar o novo status com base nos pagamentos e datas
      const newStatus = determineNewLoanStatus(loan, loanPayments);
      
      // Se o status mudou, atualizar o empréstimo
      if (newStatus !== loan.status) {
        return { ...loan, status: newStatus };
      }
      
      return loan;
    });
    
    // Atualizar o estado apenas se houve mudanças
    if (JSON.stringify(updatedLoans) !== JSON.stringify(loans)) {
      setLoans(updatedLoans);
    }
  }, [loans, payments]);
  
  // Borrower operations
  const addBorrower = (borrower: Omit<BorrowerType, "id">) => {
    const newBorrower: BorrowerType = {
      ...borrower,
      id: Date.now().toString()
    };
    
    setBorrowers(prev => [...prev, newBorrower]);
    toast({
      title: "Mutuário adicionado",
      description: `${borrower.name} foi adicionado com sucesso.`
    });
  };
  
  const updateBorrower = (id: string, borrower: Partial<BorrowerType>) => {
    setBorrowers(prev => 
      prev.map(b => b.id === id ? { ...b, ...borrower } : b)
    );
    toast({
      title: "Mutuário atualizado",
      description: "Os dados do mutuário foram atualizados com sucesso."
    });
  };
  
  const deleteBorrower = (id: string) => {
    // Check for associated loans
    const borrowerLoans = loans.filter(loan => loan.borrowerId === id);
    if (borrowerLoans.length > 0) {
      toast({
        title: "Erro ao excluir",
        description: "Este mutuário possui empréstimos associados e não pode ser excluído.",
        variant: "destructive"
      });
      return;
    }
    
    setBorrowers(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Mutuário excluído",
      description: "O mutuário foi excluído com sucesso."
    });
  };
  
  const getBorrowerById = (id: string) => {
    return borrowers.find(b => b.id === id);
  };
  
  // Loan operations
  const addLoan = (loanData: Omit<LoanType, "id" | "status" | "borrowerName">) => {
    const borrower = borrowers.find(b => b.id === loanData.borrowerId);
    
    if (!borrower) {
      toast({
        title: "Erro",
        description: "Mutuário não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    const newLoan: LoanType = {
      ...loanData,
      id: Date.now().toString(),
      status: 'active',
      borrowerName: borrower.name
    };
    
    setLoans(prev => [...prev, newLoan]);
    toast({
      title: "Empréstimo adicionado",
      description: `Empréstimo para ${borrower.name} registrado com sucesso.`
    });
  };
  
  const updateLoan = (id: string, loanData: Partial<LoanType>) => {
    // If borrowerId is being updated, we need to update borrowerName too
    let updatedLoanData = { ...loanData };
    
    if (loanData.borrowerId) {
      const borrower = borrowers.find(b => b.id === loanData.borrowerId);
      if (borrower) {
        updatedLoanData.borrowerName = borrower.name;
      }
    }
    
    setLoans(prev => 
      prev.map(loan => loan.id === id ? { ...loan, ...updatedLoanData } : loan)
    );
    
    toast({
      title: "Empréstimo atualizado",
      description: "Os dados do empréstimo foram atualizados com sucesso."
    });
  };
  
  const deleteLoan = (id: string) => {
    // Check for associated payments
    const loanPayments = payments.filter(payment => payment.loanId === id);
    
    // Remove associated payments
    if (loanPayments.length > 0) {
      setPayments(prev => prev.filter(payment => payment.loanId !== id));
    }
    
    setLoans(prev => prev.filter(loan => loan.id !== id));
    toast({
      title: "Empréstimo excluído",
      description: "O empréstimo foi excluído com sucesso."
    });
  };
  
  const getLoanById = (id: string) => {
    return loans.find(loan => loan.id === id);
  };
  
  const getLoansByBorrowerId = (borrowerId: string) => {
    return loans.filter(loan => loan.borrowerId === borrowerId);
  };
  
  // Payment operations
  const addPayment = (paymentData: Omit<PaymentType, "id">) => {
    const loan = loans.find(loan => loan.id === paymentData.loanId);
    
    if (!loan) {
      toast({
        title: "Erro",
        description: "Empréstimo não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    const newPayment: PaymentType = {
      ...paymentData,
      id: Date.now().toString()
    };
    
    setPayments(prev => [...prev, newPayment]);
    
    // Atualizar o empréstimo para "Pago" imediatamente após registrar o pagamento do mês atual
    // Isso garante que o status seja atualizado mesmo que a data de vencimento já tenha passado
    updateLoan(loan.id, { status: 'paid' });
    
    toast({
      title: "Pagamento registrado",
      description: `Pagamento de ${settings.currency} ${paymentData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado com sucesso.`
    });
  };
  
  const updatePayment = (id: string, paymentData: Partial<PaymentType>) => {
    setPayments(prev => 
      prev.map(payment => payment.id === id ? { ...payment, ...paymentData } : payment)
    );
    
    const payment = payments.find(p => p.id === id);
    if (payment) {
      const loan = loans.find(loan => loan.id === payment.loanId);
      if (loan) {
        const updatedPayments = payments.map(p => 
          p.id === id ? { ...p, ...paymentData } : p
        ).filter(p => p.loanId === loan.id);
        
        const newStatus = determineNewLoanStatus(loan, updatedPayments);
        if (newStatus !== loan.status) {
          updateLoan(loan.id, { status: newStatus });
        }
      }
    }
    
    toast({
      title: "Pagamento atualizado",
      description: "Os dados do pagamento foram atualizados com sucesso."
    });
  };
  
  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    
    setPayments(prev => prev.filter(payment => payment.id !== id));
    
    if (payment) {
      const loan = loans.find(loan => loan.id === payment.loanId);
      if (loan) {
        const updatedPayments = payments.filter(p => p.id !== id && p.loanId === loan.id);
        const newStatus = determineNewLoanStatus(loan, updatedPayments);
        
        if (newStatus !== loan.status) {
          updateLoan(loan.id, { status: newStatus });
        }
      }
    }
    
    toast({
      title: "Pagamento excluído",
      description: "O pagamento foi excluído com sucesso."
    });
  };
  
  const getPaymentsByLoanId = (loanId: string) => {
    return payments.filter(payment => payment.loanId === loanId);
  };
  
  // Calculations and analytics
  const calculateLoanMetrics = (loanId: string) => {
    const loan = loans.find(loan => loan.id === loanId);
    const loanPayments = payments.filter(payment => payment.loanId === loanId);
    
    if (!loan) {
      return {
        totalPrincipal: 0,
        totalInterest: 0,
        totalPaid: 0,
        remainingBalance: 0
      };
    }
    
    const totalPrincipal = loan.principal;
    const totalPaid = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalInterest = loanPayments.reduce((sum, payment) => sum + payment.interest, 0);
    const remainingBalance = calculateRemainingBalance(loan, loanPayments);
    
    return {
      totalPrincipal,
      totalInterest,
      totalPaid,
      remainingBalance
    };
  };
  
  const getDashboardMetrics = (): DashboardMetrics => {
    const totalLoaned = loans.reduce((sum, loan) => sum + loan.principal, 0);
    
    const totalInterestAccrued = payments.reduce((sum, payment) => sum + payment.interest, 0);
    
    const overdueLoans = loans.filter(loan => loan.status === 'overdue' || loan.status === 'defaulted');
    const totalOverdue = overdueLoans.reduce((sum, loan) => {
      const loanPayments = payments.filter(payment => payment.loanId === loan.id);
      return sum + calculateRemainingBalance(loan, loanPayments);
    }, 0);
    
    // Calcular total recebido no mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const totalReceivedThisMonth = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.date);
      // Verificar se o pagamento foi feito no mês atual
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        return sum + payment.amount;
      }
      return sum;
    }, 0);
    
    const activeLoanCount = loans.filter(loan => loan.status === 'active').length;
    const paidLoanCount = loans.filter(loan => loan.status === 'paid').length;
    const overdueLoanCount = loans.filter(loan => loan.status === 'overdue').length;
    const defaultedLoanCount = loans.filter(loan => loan.status === 'defaulted').length;
    
    return {
      totalLoaned,
      totalInterestAccrued,
      totalOverdue,
      totalBorrowers: borrowers.length,
      activeLoanCount,
      paidLoanCount,
      overdueLoanCount,
      defaultedLoanCount,
      totalReceivedThisMonth
    };
  };
  
  const getOverdueLoans = () => {
    return loans.filter(loan => loan.status === 'overdue' || loan.status === 'defaulted');
  };
  
  const getUpcomingDueLoans = (days: number) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return loans.filter(loan => {
      // Verificar apenas empréstimos ativos com programação de pagamento
      if (loan.status !== 'active' || !loan.paymentSchedule) return false;
      
      // Verificar a data do próximo pagamento, não a data de vencimento do empréstimo
      const nextPaymentDate = new Date(loan.paymentSchedule.nextPaymentDate);
      return nextPaymentDate >= today && nextPaymentDate <= futureDate;
    });
  };
  
  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast({
      title: "Configurações atualizadas",
      description: "As configurações foram atualizadas com sucesso."
    });
  };
  
  // Import/Export
  const importData = (csvData: string) => {
    try {
      // Verificar se o CSV contém as seções necessárias
      if (!csvData.includes('[BORROWERS]') || 
          !csvData.includes('[LOANS]') || 
          !csvData.includes('[PAYMENTS]')) {
        toast({
          title: "Erro na importação",
          description: "O arquivo CSV não contém as seções necessárias: [BORROWERS], [LOANS], [PAYMENTS]",
          variant: "destructive"
        });
        return;
      }
      
      const { importedBorrowers, importedLoans, importedPayments } = parseCSV(csvData);
      
      // Update state with imported data
      setBorrowers(importedBorrowers);
      setLoans(importedLoans);
      setPayments(importedPayments);
      
      toast({
        title: "Dados importados",
        description: "Importado com sucesso: " + importedBorrowers.length + " mutuários, " + 
                    importedLoans.length + " empréstimos, " + 
                    importedPayments.length + " pagamentos."
      });
    } catch (error) {
      console.error("Erro ao importar CSV:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Falha ao importar dados. Verifique o formato do arquivo CSV.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const exportData = () => {
    return generateCSV(borrowers, loans, payments);
  };
  
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

export const useLoan = () => {
  const context = useContext(LoanContext);
  
  if (context === undefined) {
    throw new Error("useLoan must be used within a LoanProvider");
  }
  
  return context;
};
