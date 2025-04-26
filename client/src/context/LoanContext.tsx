import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Borrower, 
  Loan, 
  Payment, 
  Settings,
  LoanWithBorrower,
  UpcomingPayment,
  OverdueLoan
} from "@/types";
import { parseCSV, downloadCSV } from "@/lib/utils";
import { 
  calculateRemainingBalance, 
  getDaysOverdue, 
  getDaysUntilDue,
  calculatePaymentDistribution,
  determineNewLoanStatus,
  calculateLoanMetrics
} from "@/utils/loanCalculations";

// For initial development, import mock data
import { mockBorrowers, mockLoans, mockPayments, mockSettings } from "@/lib/mockData";

interface LoanContextType {
  // Data
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  settings: Settings | null;
  
  // Loading states
  isLoading: boolean;
  
  // CRUD operations
  addBorrower: (borrower: Omit<Borrower, "id">) => Promise<Borrower>;
  updateBorrower: (id: number, borrower: Partial<Borrower>) => Promise<Borrower>;
  deleteBorrower: (id: number) => Promise<boolean>;
  
  addLoan: (loan: Omit<Loan, "id" | "status">) => Promise<Loan>;
  updateLoan: (id: number, loan: Partial<Loan>) => Promise<Loan>;
  deleteLoan: (id: number) => Promise<boolean>;
  
  addPayment: (payment: Omit<Payment, "id">) => Promise<Payment>;
  updatePayment: (id: number, payment: Partial<Payment>) => Promise<Payment>;
  deletePayment: (id: number) => Promise<boolean>;
  
  updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
  
  // Query operations
  getBorrowerById: (id: number) => Borrower | undefined;
  getLoanById: (id: number) => Loan | undefined;
  getLoansByBorrowerId: (borrowerId: number) => Loan[];
  getPaymentsByLoanId: (loanId: number) => Payment[];
  
  // Business logic
  calculateLoanMetrics: () => {
    totalLent: number;
    totalInterest: number;
    totalOverdue: number;
    totalToReceive: number;
    activeLoans: number;
    paidLoans: number;
    overdueLoans: number;
    defaultedLoans: number;
  };
  getLoansWithBorrowers: () => LoanWithBorrower[];
  getOverdueLoans: () => OverdueLoan[];
  getUpcomingDueLoans: () => UpcomingPayment[];
  
  // Import/Export
  exportDataToCSV: () => void;
  importDataFromCSV: (file: File) => Promise<boolean>;
}

const LoanContext = createContext<LoanContextType | null>(null);

export const LoanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from the API endpoints
        // For now, use mock data
        setBorrowers(mockBorrowers);
        setLoans(mockLoans);
        setPayments(mockPayments);
        setSettings(mockSettings);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados iniciais",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // CRUD operations for Borrowers
  const addBorrower = async (borrower: Omit<Borrower, "id">): Promise<Borrower> => {
    try {
      // In a real app:
      // const response = await apiRequest("POST", "/api/borrowers", borrower);
      // const newBorrower = await response.json();
      
      // For now:
      const newBorrower: Borrower = {
        ...borrower,
        id: Math.max(0, ...borrowers.map(b => b.id)) + 1
      };
      
      setBorrowers([...borrowers, newBorrower]);
      
      toast({
        title: "Mutuário adicionado",
        description: `${newBorrower.name} foi adicionado com sucesso`,
      });
      
      return newBorrower;
    } catch (error) {
      console.error("Error adding borrower:", error);
      toast({
        title: "Erro ao adicionar mutuário",
        description: "Não foi possível adicionar o mutuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBorrower = async (id: number, borrowerData: Partial<Borrower>): Promise<Borrower> => {
    try {
      // In a real app:
      // const response = await apiRequest("PATCH", `/api/borrowers/${id}`, borrowerData);
      // const updatedBorrower = await response.json();
      
      // For now:
      const index = borrowers.findIndex(b => b.id === id);
      if (index === -1) throw new Error("Borrower not found");
      
      const updatedBorrower = { ...borrowers[index], ...borrowerData };
      const newBorrowers = [...borrowers];
      newBorrowers[index] = updatedBorrower;
      
      setBorrowers(newBorrowers);
      
      toast({
        title: "Mutuário atualizado",
        description: `${updatedBorrower.name} foi atualizado com sucesso`,
      });
      
      return updatedBorrower;
    } catch (error) {
      console.error("Error updating borrower:", error);
      toast({
        title: "Erro ao atualizar mutuário",
        description: "Não foi possível atualizar o mutuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteBorrower = async (id: number): Promise<boolean> => {
    try {
      // Check if borrower has any loans
      const borrowerLoans = loans.filter(loan => loan.borrowerId === id);
      if (borrowerLoans.length > 0) {
        throw new Error("Cannot delete borrower with active loans");
      }
      
      // In a real app:
      // await apiRequest("DELETE", `/api/borrowers/${id}`);
      
      // For now:
      setBorrowers(borrowers.filter(b => b.id !== id));
      
      toast({
        title: "Mutuário removido",
        description: "O mutuário foi removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting borrower:", error);
      
      let errorMessage = "Não foi possível remover o mutuário";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao remover mutuário",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // CRUD operations for Loans
  const addLoan = async (loanData: Omit<Loan, "id" | "status">): Promise<Loan> => {
    try {
      // In a real app:
      // const response = await apiRequest("POST", "/api/loans", loanData);
      // const newLoan = await response.json();
      
      // For now:
      const newLoan: Loan = {
        ...loanData,
        id: Math.max(0, ...loans.map(l => l.id)) + 1,
        status: "active"
      };
      
      setLoans([...loans, newLoan]);
      
      toast({
        title: "Empréstimo adicionado",
        description: "O empréstimo foi adicionado com sucesso",
      });
      
      return newLoan;
    } catch (error) {
      console.error("Error adding loan:", error);
      toast({
        title: "Erro ao adicionar empréstimo",
        description: "Não foi possível adicionar o empréstimo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLoan = async (id: number, loanData: Partial<Loan>): Promise<Loan> => {
    try {
      // In a real app:
      // const response = await apiRequest("PATCH", `/api/loans/${id}`, loanData);
      // const updatedLoan = await response.json();
      
      // For now:
      const index = loans.findIndex(l => l.id === id);
      if (index === -1) throw new Error("Loan not found");
      
      const updatedLoan = { ...loans[index], ...loanData };
      const newLoans = [...loans];
      newLoans[index] = updatedLoan;
      
      setLoans(newLoans);
      
      toast({
        title: "Empréstimo atualizado",
        description: "O empréstimo foi atualizado com sucesso",
      });
      
      return updatedLoan;
    } catch (error) {
      console.error("Error updating loan:", error);
      toast({
        title: "Erro ao atualizar empréstimo",
        description: "Não foi possível atualizar o empréstimo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteLoan = async (id: number): Promise<boolean> => {
    try {
      // Check if loan has any payments
      const loanPayments = payments.filter(payment => payment.loanId === id);
      if (loanPayments.length > 0) {
        throw new Error("Cannot delete loan with payments");
      }
      
      // In a real app:
      // await apiRequest("DELETE", `/api/loans/${id}`);
      
      // For now:
      setLoans(loans.filter(l => l.id !== id));
      
      toast({
        title: "Empréstimo removido",
        description: "O empréstimo foi removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting loan:", error);
      
      let errorMessage = "Não foi possível remover o empréstimo";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao remover empréstimo",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // CRUD operations for Payments
  const addPayment = async (paymentData: Omit<Payment, "id">): Promise<Payment> => {
    try {
      // In a real app:
      // const response = await apiRequest("POST", "/api/payments", paymentData);
      // const newPayment = await response.json();
      
      // For now:
      const newPayment: Payment = {
        ...paymentData,
        id: Math.max(0, ...payments.map(p => p.id)) + 1
      };
      
      setPayments([...payments, newPayment]);
      
      // Update loan status based on payment
      const loan = loans.find(l => l.id === paymentData.loanId);
      if (loan) {
        const loanPayments = [...payments, newPayment].filter(p => p.loanId === loan.id);
        const newStatus = determineNewLoanStatus(loan, loanPayments);
        const remainingBalance = calculateRemainingBalance(loan, loanPayments);
        
        // Update the loan
        if (newStatus !== loan.status || remainingBalance <= 0) {
          updateLoan(loan.id, { 
            status: newStatus,
            // If loan is paid, clear nextPaymentDate
            nextPaymentDate: newStatus === "paid" ? null : loan.nextPaymentDate
          });
        }
      }
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso",
      });
      
      return newPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePayment = async (id: number, paymentData: Partial<Payment>): Promise<Payment> => {
    try {
      // In a real app:
      // const response = await apiRequest("PATCH", `/api/payments/${id}`, paymentData);
      // const updatedPayment = await response.json();
      
      // For now:
      const index = payments.findIndex(p => p.id === id);
      if (index === -1) throw new Error("Payment not found");
      
      const updatedPayment = { ...payments[index], ...paymentData };
      const newPayments = [...payments];
      newPayments[index] = updatedPayment;
      
      setPayments(newPayments);
      
      // Update loan status if necessary
      if (paymentData.loanId || paymentData.amount || paymentData.principal || paymentData.interest) {
        const loanId = paymentData.loanId || payments[index].loanId;
        const loan = loans.find(l => l.id === loanId);
        
        if (loan) {
          const loanPayments = newPayments.filter(p => p.loanId === loan.id);
          const newStatus = determineNewLoanStatus(loan, loanPayments);
          
          if (newStatus !== loan.status) {
            updateLoan(loan.id, { status: newStatus });
          }
        }
      }
      
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi atualizado com sucesso",
      });
      
      return updatedPayment;
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Não foi possível atualizar o pagamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePayment = async (id: number): Promise<boolean> => {
    try {
      // In a real app:
      // await apiRequest("DELETE", `/api/payments/${id}`);
      
      // For now:
      const payment = payments.find(p => p.id === id);
      if (!payment) throw new Error("Payment not found");
      
      const newPayments = payments.filter(p => p.id !== id);
      setPayments(newPayments);
      
      // Update loan status
      const loan = loans.find(l => l.id === payment.loanId);
      if (loan) {
        const loanPayments = newPayments.filter(p => p.loanId === loan.id);
        const newStatus = determineNewLoanStatus(loan, loanPayments);
        
        if (newStatus !== loan.status) {
          updateLoan(loan.id, { status: newStatus });
        }
      }
      
      toast({
        title: "Pagamento removido",
        description: "O pagamento foi removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Erro ao remover pagamento",
        description: "Não foi possível remover o pagamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Settings operations
  const updateSettings = async (settingsData: Partial<Settings>): Promise<Settings> => {
    try {
      // In a real app:
      // const response = await apiRequest("PATCH", "/api/settings", settingsData);
      // const updatedSettings = await response.json();
      
      // For now:
      const updatedSettings = { ...settings, ...settingsData } as Settings;
      setSettings(updatedSettings);
      
      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram atualizadas com sucesso",
      });
      
      return updatedSettings;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Erro ao atualizar configurações",
        description: "Não foi possível atualizar as configurações",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Query operations
  const getBorrowerById = (id: number): Borrower | undefined => {
    return borrowers.find(borrower => borrower.id === id);
  };

  const getLoanById = (id: number): Loan | undefined => {
    return loans.find(loan => loan.id === id);
  };

  const getLoansByBorrowerId = (borrowerId: number): Loan[] => {
    return loans.filter(loan => loan.borrowerId === borrowerId);
  };

  const getPaymentsByLoanId = (loanId: number): Payment[] => {
    return payments.filter(payment => payment.loanId === loanId);
  };

  // Business logic
  const calculateLoanMetricsFunc = () => {
    return calculateLoanMetrics(loans, payments);
  };

  const getLoansWithBorrowers = (): LoanWithBorrower[] => {
    return loans.map(loan => {
      const borrower = borrowers.find(b => b.id === loan.borrowerId);
      return {
        ...loan,
        borrowerName: borrower ? borrower.name : "Unknown"
      };
    });
  };

  const getOverdueLoans = (): OverdueLoan[] => {
    const overdueLoans: OverdueLoan[] = [];
    
    loans.forEach(loan => {
      if (loan.status === "overdue" || loan.status === "defaulted") {
        const borrower = borrowers.find(b => b.id === loan.borrowerId);
        if (borrower) {
          overdueLoans.push({
            id: loan.id,
            borrowerName: borrower.name,
            borrowerEmail: borrower.email,
            principal: loan.principal,
            installmentAmount: loan.installmentAmount || 0,
            dueDate: loan.nextPaymentDate || "",
            daysOverdue: getDaysOverdue(loan),
            status: loan.status
          });
        }
      }
    });
    
    return overdueLoans.sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  const getUpcomingDueLoans = (): UpcomingPayment[] => {
    const upcomingPayments: UpcomingPayment[] = [];
    
    loans.forEach(loan => {
      if (loan.status === "active" && loan.nextPaymentDate) {
        const borrower = borrowers.find(b => b.id === loan.borrowerId);
        if (borrower) {
          const daysUntilDue = getDaysUntilDue(loan);
          
          if (daysUntilDue > 0 && daysUntilDue <= 14) { // Only show loans due in the next 14 days
            upcomingPayments.push({
              id: loan.id,
              borrowerName: borrower.name,
              amount: loan.installmentAmount || 0,
              dueDate: loan.nextPaymentDate,
              daysUntilDue,
              loanId: loan.id
            });
          }
        }
      }
    });
    
    return upcomingPayments.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };

  // Import/Export
  const exportDataToCSV = () => {
    try {
      // Create a single export object
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "1.0"
        },
        borrowers,
        loans,
        payments,
        settings
      };
      
      // Convert to CSV
      downloadCSV([exportData], "loanbuddy_export");
      
      toast({
        title: "Dados exportados",
        description: "Os dados foram exportados com sucesso",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados",
        variant: "destructive"
      });
    }
  };

  const importDataFromCSV = async (file: File): Promise<boolean> => {
    try {
      const data = await parseCSV(file);
      
      if (data.length !== 1) {
        throw new Error("Invalid import file format");
      }
      
      const importData = data[0];
      
      if (!importData.borrowers || !importData.loans || !importData.payments) {
        throw new Error("Import file is missing required data");
      }
      
      // Set the imported data
      setBorrowers(importData.borrowers);
      setLoans(importData.loans);
      setPayments(importData.payments);
      
      if (importData.settings) {
        setSettings(importData.settings);
      }
      
      toast({
        title: "Dados importados",
        description: "Os dados foram importados com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      
      let errorMessage = "Não foi possível importar os dados";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao importar dados",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const contextValue: LoanContextType = {
    borrowers,
    loans,
    payments,
    settings,
    isLoading,
    
    addBorrower,
    updateBorrower,
    deleteBorrower,
    
    addLoan,
    updateLoan,
    deleteLoan,
    
    addPayment,
    updatePayment,
    deletePayment,
    
    updateSettings,
    
    getBorrowerById,
    getLoanById,
    getLoansByBorrowerId,
    getPaymentsByLoanId,
    
    calculateLoanMetrics: calculateLoanMetricsFunc,
    getLoansWithBorrowers,
    getOverdueLoans,
    getUpcomingDueLoans,
    
    exportDataToCSV,
    importDataFromCSV
  };

  return (
    <LoanContext.Provider value={contextValue}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  
  if (!context) {
    throw new Error("useLoanContext must be used within a LoanProvider");
  }
  
  return context;
};
