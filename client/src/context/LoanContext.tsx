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
import { parseISO, format } from "date-fns";
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
} from "@/lib/memoryClient";

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
  archiveLoan: (id: string) => void;
  getArchivedLoans: () => LoanType[];
  
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
  getEstimatedMonthlyPayments: () => number;
  
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
  // Dados de teste para simulação
  const initialBorrowers: BorrowerType[] = [
    {
      id: "b1",
      name: "João Silva",
      email: "joao@teste.com",
      phone: "11987654321"
    },
    {
      id: "b2",
      name: "Maria Santos",
      email: "maria@teste.com",
      phone: "11912345678"
    },
    {
      id: "b3",
      name: "Pedro Oliveira",
      email: "pedro@teste.com",
      phone: "11999998888"
    }
  ];
  
  const initialLoans: LoanType[] = [
    {
      id: "l1",
      borrowerId: "b1",
      borrowerName: "João Silva",
      principal: 5000,
      interestRate: 5,
      issueDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setMonth(new Date().getMonth() + 11)), 'yyyy-MM-dd'),
      status: 'active',
      paymentSchedule: {
        frequency: 'monthly',
        nextPaymentDate: format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd'),
        installments: 12,
        installmentAmount: 437.50
      }
    },
    {
      id: "l2",
      borrowerId: "b2",
      borrowerName: "Maria Santos",
      principal: 3000,
      interestRate: 6,
      issueDate: format(new Date(new Date().setMonth(new Date().getMonth() - 2)), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() - 5)), 'yyyy-MM-dd'),
      status: 'overdue',
      paymentSchedule: {
        frequency: 'monthly',
        nextPaymentDate: format(new Date(new Date().setDate(new Date().getDate() - 5)), 'yyyy-MM-dd'),
        installments: 6,
        installmentAmount: 525.00
      }
    },
    {
      id: "l3",
      borrowerId: "b3",
      borrowerName: "Pedro Oliveira",
      principal: 10000,
      interestRate: 4,
      issueDate: format(new Date(new Date().setMonth(new Date().getMonth() - 6)), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'),
      status: 'paid',
      paymentSchedule: {
        frequency: 'monthly',
        nextPaymentDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        installments: 12,
        installmentAmount: 866.67
      }
    }
  ];
  
  const initialPayments: PaymentType[] = [
    {
      id: "p1",
      loanId: "l1",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
      amount: 437.50,
      principal: 375.00,
      interest: 62.50
    },
    {
      id: "p2",
      loanId: "l3",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 5)), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 800.00,
      interest: 66.67
    },
    {
      id: "p3",
      loanId: "l3",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 4)), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 810.00,
      interest: 56.67
    },
    {
      id: "p4",
      loanId: "l3",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 3)), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 820.00,
      interest: 46.67
    },
    {
      id: "p5",
      loanId: "l3",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 2)), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 830.00,
      interest: 36.67
    },
    {
      id: "p6",
      loanId: "l3",
      date: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 840.00,
      interest: 26.67
    },
    {
      id: "p7",
      loanId: "l3",
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 866.67,
      principal: 850.00,
      interest: 16.67
    }
  ];

  // Inicializar estados com dados de teste
  const [borrowers, setBorrowers] = useState<BorrowerType[]>(initialBorrowers);
  const [loans, setLoans] = useState<LoanType[]>(initialLoans);
  const [payments, setPayments] = useState<PaymentType[]>(initialPayments);
  
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
  
  const archiveLoan = (id: string) => {
    console.log("Função archiveLoan chamada com ID:", id);
    
    const loan = loans.find(loan => loan.id === id);
    console.log("Empréstimo encontrado:", loan);
    
    if (!loan) {
      toast({
        title: "Erro",
        description: "Empréstimo não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Só pode arquivar empréstimos pagos
    if (loan.status !== 'paid') {
      console.log("Empréstimo não está com status pago:", loan.status);
      toast({
        title: "Não é possível arquivar",
        description: "Apenas empréstimos pagos podem ser arquivados",
        variant: "destructive"
      });
      return;
    }
    
    // Atualiza o status para 'archived'
    console.log("Atualizando status para 'archived'");
    setLoans(prev => {
      const updatedLoans = prev.map(l => 
        l.id === id ? { ...l, status: 'archived' as LoanStatus } : l
      );
      console.log("Empréstimos atualizados:", updatedLoans);
      return updatedLoans;
    });
    
    toast({
      title: "Empréstimo arquivado",
      description: `O empréstimo para ${loan.borrowerName} foi arquivado com sucesso.`
    });
  };
  
  const getArchivedLoans = () => {
    console.log("getArchivedLoans chamado, total de empréstimos:", loans.length);
    console.log("Empréstimos e seus status:", loans.map(loan => `${loan.id}: ${loan.status}`));
    
    const archivedLoans = loans.filter(loan => {
      console.log(`Verificando empréstimo ${loan.id}, status: ${loan.status}, tipo: ${typeof loan.status}`);
      return loan.status === 'archived';
    });
    
    console.log("Empréstimos arquivados encontrados:", archivedLoans.length);
    if (archivedLoans.length > 0) {
      console.log("Detalhes dos empréstimos arquivados:", archivedLoans);
    }
    
    return archivedLoans;
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
  
  const getEstimatedMonthlyPayments = (): number => {
    console.log("Calculando pagamentos estimados para o mês");
    
    // Pegar todos os empréstimos não arquivados (ativos, vencidos)
    const validLoans = loans.filter(loan => 
      loan.status !== 'archived' && 
      (loan.status === 'active' || loan.status === 'overdue')
    );
    console.log(`Total de empréstimos não arquivados (ativos/vencidos): ${validLoans.length}`);
    
    // Verificar empréstimos com programações de pagamento
    const loansWithSchedule = validLoans.filter(loan => 
      loan.paymentSchedule && 
      loan.paymentSchedule.nextPaymentDate && 
      loan.paymentSchedule.installmentAmount
    );
    console.log(`Empréstimos com programação: ${loansWithSchedule.length}`);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calcular a soma estimada de pagamentos para o mês atual
    let estimatedTotal = 0;
    
    // Se não existirem empréstimos com programação, usar uma estimativa baseada no principal
    if (loansWithSchedule.length === 0) {
      // Fallback: usar todos os empréstimos válidos e calcular um valor estimado
      estimatedTotal = validLoans.reduce((sum, loan) => {
        // Estimativa simples: valor do principal dividido por 12 (média de parcelas mensais)
        // ou usar o valor de installmentAmount se disponível
        const estimatedInstallment = loan.paymentSchedule?.installmentAmount || (loan.principal / 12);
        return sum + estimatedInstallment;
      }, 0);
      
      console.log(`Usando estimativa com base no principal/parcelas: ${estimatedTotal}`);
      return estimatedTotal;
    }
    
    // Processa empréstimos com programação de pagamento
    for (const loan of loansWithSchedule) {
      if (!loan.paymentSchedule) continue;
      
      try {
        // Pegamos a data do próximo pagamento de forma mais robusta
        let nextPaymentDate: Date | null = null;
        const dateStr = loan.paymentSchedule.nextPaymentDate;
        
        // Tratamento robusto para datas em diferentes formatos
        if (typeof dateStr === 'string') {
          try {
            // Primeiro tenta como ISO
            nextPaymentDate = new Date(dateStr);
            
            // Verifica se é uma data válida
            if (isNaN(nextPaymentDate.getTime())) {
              // Tenta parseISO como alternativa
              nextPaymentDate = parseISO(dateStr);
              
              // Se ainda for inválida, tenta como DD/MM/YYYY
              if (isNaN(nextPaymentDate.getTime()) && dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                  const day = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1; // Meses são 0-indexed
                  const year = parseInt(parts[2], 10);
                  nextPaymentDate = new Date(year, month, day);
                } else {
                  throw new Error('Formato de data inválido');
                }
              }
            }
          } catch (e) {
            console.warn('Erro ao processar data:', dateStr, e);
            continue;
          }
        } else {
          console.warn('Data de pagamento não é uma string:', dateStr);
          continue;
        }
        
        // Se depois de todas as tentativas a data ainda for inválida, pula este empréstimo
        if (!nextPaymentDate || isNaN(nextPaymentDate.getTime())) {
          console.warn('Data inválida após tentativas de conversão:', dateStr);
          continue;
        }
        
        // Verificamos se o pagamento é para o mês atual
        if (nextPaymentDate.getMonth() === currentMonth && 
            nextPaymentDate.getFullYear() === currentYear) {
          
          // É para este mês, adiciona ao total estimado
          estimatedTotal += loan.paymentSchedule.installmentAmount;
          const formattedDate = `${nextPaymentDate.getDate()}/${nextPaymentDate.getMonth() + 1}/${nextPaymentDate.getFullYear()}`;
          console.log(`Adicionando pagamento de ${loan.borrowerName} PARA ESTE MÊS: ${loan.paymentSchedule.installmentAmount} (data: ${formattedDate})`);
        } else {
          // Formato da data de forma mais clara para o diagnóstico
          const formattedDate = `${nextPaymentDate.getDate()}/${nextPaymentDate.getMonth() + 1}/${nextPaymentDate.getFullYear()}`;
          console.log(`Pagamento de ${loan.borrowerName} NÃO é para este mês (${currentMonth + 1}/${currentYear}): ${loan.paymentSchedule.installmentAmount} (data: ${formattedDate})`);
        }
      } catch (error) {
        console.warn('Erro ao processar empréstimo:', loan.id, error);
      }
    }
    
    console.log(`Total estimado final APENAS PARA ESTE MÊS: ${estimatedTotal}`);
    return estimatedTotal;
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
    // Filtrar empréstimos em atraso
    return loans.filter(loan => 
      loan.status === 'overdue' || loan.status === 'defaulted'
    );
  };
  
  const getUpcomingDueLoans = (days: number) => {
    // Definir hoje com hora, minutos e segundos zerados para comparação de datas por dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return loans.filter(loan => {
      // Não incluir empréstimos arquivados
      if (loan.status === 'archived') return false;
      
      // Verificar empréstimos com programação de pagamento
      if (!loan.paymentSchedule || !loan.paymentSchedule.nextPaymentDate) return false;
      
      try {
        // Tratar a data do próximo pagamento
        let nextPaymentDate;
        const dateStr = loan.paymentSchedule.nextPaymentDate;
        
        // Verificar o formato da data e fazer o parse apropriado
        if (typeof dateStr === 'string') {
          // Tenta tratar como data ISO
          try {
            nextPaymentDate = parseISO(dateStr);
            
            // Verificar se é uma data válida
            if (isNaN(nextPaymentDate.getTime())) {
              throw new Error('Data inválida após parseISO');
            }
          } catch (e) {
            // Tenta tratar como formato DD/MM/YYYY
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Meses são 0-indexed em JS
                const year = parseInt(parts[2], 10);
                nextPaymentDate = new Date(year, month, day);
              } else {
                return false; // Formato de data inválido
              }
            } else {
              return false; // Não conseguiu analisar a data
            }
          }
        } else {
          return false; // nextPaymentDate não é uma string
        }
        
        // Zerar horas, minutos e segundos para comparação apenas por dia
        const nextPaymentDay = new Date(nextPaymentDate);
        nextPaymentDay.setHours(0, 0, 0, 0);
        
        // IMPORTANTE: Modificado para incluir pagamentos do dia atual e vencidos
        // Verificar se o pagamento é para hoje (dia atual)
        const isToday = nextPaymentDay.getTime() === today.getTime();
        
        // Verificar se o pagamento está próximo (dentro do período de dias especificado)
        const isUpcoming = nextPaymentDay > today && nextPaymentDay <= futureDate;
        
        // Verificar se o pagamento está vencido (antes ou igual ao dia atual)
        const isDue = nextPaymentDay <= today;
        
        // CORREÇÃO IMPORTANTE: Garantir que empréstimos com status 'overdue' ou no dia
        // atual sempre apareçam, mesmo se nextPaymentDate for igual a today
        const shouldShow = isToday || // É hoje
                           isUpcoming || // Está dentro do período futuro especificado
                           (isDue && loan.status !== 'paid') || // Está vencido e não foi pago
                           loan.status === 'overdue'; // Está marcado como vencido
        
        // Retorna true se a data for válida e algum dos critérios acima for atendido
        return !isNaN(nextPaymentDate.getTime()) && shouldShow;
      } catch (error) {
        console.warn('Erro ao analisar paymentSchedule para o empréstimo ' + loan.id + ':', error);
        return false;
      }
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
  const importData = (data: string) => {
    // Importar utilitários de log
    import('@/utils/logUtils').then(({
      logOperationStart,
      logOperationSuccess,
      logOperationError,
      logSection,
      logSuccess,
      logWarning,
      logInfo,
      logError,
      logImportExportStats,
      logDataValidation
    }) => {
      // Verificar se é um reset
      if (data === 'RESET') {
        logOperationStart('RESET DE DADOS');
        logInfo('Limpando todos os dados');
        
        const defaultSettings = {
          defaultInterestRate: 5,
          defaultPaymentFrequency: "monthly" as const,
          defaultInstallments: 12,
          currency: "R$"
        };
        
        // Limpar todos os dados (arrays vazios)
        setBorrowers([]);
        setLoans([]);
        setPayments([]);
        setSettings(defaultSettings);
        
        // Salvar em memória (não em localStorage)
        saveBorrowers([]);
        saveLoans([]);
        savePayments([]);
        saveSettings(defaultSettings);
        
        logSuccess('Dados limpos com sucesso');
        logOperationSuccess('RESET DE DADOS', {
          Mutuários: 0,
          Empréstimos: 0,
          Pagamentos: 0
        });
        
        toast({
          title: "Dados limpos",
          description: "Todos os dados foram removidos do aplicativo"
        });
        
        return;
      }
      
      try {
        logOperationStart('IMPORTAÇÃO DE DADOS');
        
        // Variáveis para armazenar os dados importados
        let importedBorrowers: BorrowerType[] = [];
        let importedLoans: LoanType[] = [];
        let importedPayments: PaymentType[] = [];
        let importFormat = 'desconhecido';
        
        // Tenta analisar como JSON primeiro
        try {
          logInfo('Tentando analisar como JSON');
          const jsonData = JSON.parse(data);
          importFormat = 'JSON';
          
          // Verifica se o JSON contém as estruturas esperadas
          if (Array.isArray(jsonData.borrowers) && 
              Array.isArray(jsonData.loans) && 
              Array.isArray(jsonData.payments)) {
            
            importedBorrowers = jsonData.borrowers;
            importedLoans = jsonData.loans;
            importedPayments = jsonData.payments;
            
            // Registra detalhes de cada tipo
            logSuccess(`Mutuários encontrados: ${importedBorrowers.length}`);
            logSuccess(`Empréstimos encontrados: ${importedLoans.length}`);
            logSuccess(`Pagamentos encontrados: ${importedPayments.length}`);
            
            // Validação básica de estrutura
            logSection('VALIDAÇÃO DE ESTRUTURA');
            
            // Verificar estrutura dos mutuários
            const invalidBorrowers = importedBorrowers.filter(b => !b.id || !b.name);
            if (invalidBorrowers.length > 0) {
              logWarning(`${invalidBorrowers.length} mutuários com estrutura incompleta`, 
                invalidBorrowers.map(b => ({ id: b.id, nome: b.name })));
            } else {
              logSuccess('Todos os mutuários têm estrutura válida');
            }
            
            // Verificar estrutura dos empréstimos e consertar paymentSchedule se for string
            let scheduleFixCount = 0;
            importedLoans.forEach(loan => {
              if (loan.paymentSchedule && typeof loan.paymentSchedule === 'string') {
                try {
                  loan.paymentSchedule = JSON.parse(loan.paymentSchedule as any);
                  scheduleFixCount++;
                } catch (e) {
                  logWarning(`Erro ao analisar paymentSchedule do empréstimo ${loan.id}`, e);
                }
              }
            });
            
            if (scheduleFixCount > 0) {
              logInfo(`${scheduleFixCount} objetos paymentSchedule foram convertidos de string para objeto`);
            }
            
            // Verificar estrutura dos empréstimos
            const invalidLoansStructure = importedLoans.filter(
              l => !l.id || !l.borrowerId || l.principal === undefined || l.principal === null
            );
            if (invalidLoansStructure.length > 0) {
              logWarning(`${invalidLoansStructure.length} empréstimos com estrutura incompleta`, 
                invalidLoansStructure.map(l => ({ id: l.id, borrowerId: l.borrowerId })));
            } else {
              logSuccess('Todos os empréstimos têm estrutura válida');
            }
            
            // Verificar estrutura dos pagamentos
            const invalidPaymentsStructure = importedPayments.filter(
              p => !p.id || !p.loanId || p.amount === undefined || p.amount === null
            );
            if (invalidPaymentsStructure.length > 0) {
              logWarning(`${invalidPaymentsStructure.length} pagamentos com estrutura incompleta`, 
                invalidPaymentsStructure.map(p => ({ id: p.id, loanId: p.loanId })));
            } else {
              logSuccess('Todos os pagamentos têm estrutura válida');
            }
            
            logImportExportStats({
              format: 'JSON',
              borrowers: importedBorrowers.length,
              loans: importedLoans.length,
              payments: importedPayments.length
            });
          } else {
            throw new Error("Estrutura de dados JSON inválida");
          }
        } catch (jsonError) {
          // Se falhar como JSON, tenta como CSV
          logWarning('Não é um JSON válido, tentando CSV...');
          importFormat = 'CSV';
          
          // Verificar se o CSV contém as seções necessárias
          if (!data.includes('[BORROWERS]') || 
              !data.includes('[LOANS]') || 
              !data.includes('[PAYMENTS]')) {
            throw new Error("O arquivo CSV não contém as seções necessárias: [BORROWERS], [LOANS], [PAYMENTS]");
          }
          
          const parsed = parseCSV(data);
          importedBorrowers = parsed.importedBorrowers;
          importedLoans = parsed.importedLoans;
          importedPayments = parsed.importedPayments;
          
          logSuccess(`Mutuários encontrados no CSV: ${importedBorrowers.length}`);
          logSuccess(`Empréstimos encontrados no CSV: ${importedLoans.length}`);
          logSuccess(`Pagamentos encontrados no CSV: ${importedPayments.length}`);
          
          logImportExportStats({
            format: 'CSV',
            borrowers: importedBorrowers.length,
            loans: importedLoans.length,
            payments: importedPayments.length
          });
        }
        
        // Validar relacionamentos entre entidades
        const borrowerIds = new Set(importedBorrowers.map(b => b.id));
        
        // Verificar se todos os empréstimos referenciam mutuários existentes
        const invalidLoans = importedLoans.filter(loan => !borrowerIds.has(loan.borrowerId));
        
        // Verificar se todos os pagamentos referenciam empréstimos existentes
        const loanIds = new Set(importedLoans.map(l => l.id));
        const invalidPayments = importedPayments.filter(payment => !loanIds.has(payment.loanId));
        
        // Exibir validação de dados
        logDataValidation({
          borrowerIds: borrowerIds.size,
          loanIds: loanIds.size,
          invalidLoans: invalidLoans.map(loan => ({ id: loan.id, borrowerId: loan.borrowerId })),
          invalidPayments: invalidPayments.map(payment => ({ id: payment.id, loanId: payment.loanId }))
        });
        
        // Atualizar o estado com os dados importados
        logSection('SALVANDO DADOS');
        logInfo('Atualizando estado da aplicação');
        
        setBorrowers(importedBorrowers);
        setLoans(importedLoans);
        setPayments(importedPayments);
        
        // Salvar em memória (não em localStorage)
        logInfo('Salvando dados em memória');
        saveBorrowers(importedBorrowers);
        saveLoans(importedLoans);
        savePayments(importedPayments);
        
        // Estatísticas para o log final
        const stats = {
          Formato: importFormat,
          Mutuários: importedBorrowers.length,
          Empréstimos: importedLoans.length,
          Pagamentos: importedPayments.length,
          'Empréstimos inválidos': invalidLoans.length,
          'Pagamentos inválidos': invalidPayments.length
        };
        
        logOperationSuccess('IMPORTAÇÃO DE DADOS', stats);
        
        // Notificação para o usuário
        toast({
          title: "Dados importados",
          description: `Importado com sucesso: ${importedBorrowers.length} mutuários, ${importedLoans.length} empréstimos, ${importedPayments.length} pagamentos.`
        });
      } catch (error) {
        logOperationError('IMPORTAÇÃO DE DADOS', error);
        
        // Mensagem de erro mais específica
        let errorMessage = "Falha ao importar dados. Verifique o formato do arquivo.";
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro na importação",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Re-lançar o erro para que o chamador possa lidar com ele, se necessário
        throw error;
      }
    });
  };
  
  const exportData = () => {
    // Importar utilitários de log
    import('@/utils/logUtils').then(({
      logOperationStart,
      logOperationSuccess,
      logSection,
      logInfo
    }) => {
      logOperationStart('EXPORTAÇÃO DE DADOS');
      logInfo('Iniciando exportação para CSV');
      
      logSection('ESTATÍSTICAS DOS DADOS');
      
      // Exibir estatísticas dos dados sendo exportados
      console.table({
        "Mutuários": borrowers.length,
        "Empréstimos": loans.length,
        "Pagamentos": payments.length,
        "Total de registros": borrowers.length + loans.length + payments.length
      });
      
      // Exibir informações sobre status dos empréstimos
      const loanStatuses = loans.reduce((acc, loan) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1;
        return acc;
      }, {} as Record<LoanStatus, number>);
      
      logInfo('Distribuição de status dos empréstimos');
      console.table(loanStatuses);
      
      logOperationSuccess('EXPORTAÇÃO DE DADOS', {
        Mutuários: borrowers.length,
        Empréstimos: loans.length,
        Pagamentos: payments.length
      });
    });
    
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
    archiveLoan,
    getArchivedLoans,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByLoanId,
    calculateLoanMetrics,
    getDashboardMetrics,
    getOverdueLoans,
    getUpcomingDueLoans,
    getEstimatedMonthlyPayments,
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
