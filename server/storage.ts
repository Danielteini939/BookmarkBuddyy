import { 
  users, type User, type InsertUser,
  borrowers, type Borrower, type InsertBorrower,
  loans, type Loan, type InsertLoan,
  payments, type Payment, type InsertPayment,
  settings, type Settings, type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Borrowers
  getAllBorrowers(): Promise<Borrower[]>;
  getBorrower(id: number): Promise<Borrower | undefined>;
  createBorrower(borrower: InsertBorrower): Promise<Borrower>;
  updateBorrower(id: number, borrower: Partial<InsertBorrower>): Promise<Borrower | undefined>;
  deleteBorrower(id: number): Promise<boolean>;
  
  // Loans
  getAllLoans(): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  getLoansByBorrowerId(borrowerId: number): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;
  
  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByLoanId(loanId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private borrowers: Map<number, Borrower>;
  private loans: Map<number, Loan>;
  private payments: Map<number, Payment>;
  private appSettings: Settings | undefined;
  
  private userCurrentId: number;
  private borrowerCurrentId: number;
  private loanCurrentId: number;
  private paymentCurrentId: number;
  private settingsId: number;

  constructor() {
    this.users = new Map();
    this.borrowers = new Map();
    this.loans = new Map();
    this.payments = new Map();

    this.userCurrentId = 1;
    this.borrowerCurrentId = 1;
    this.loanCurrentId = 1;
    this.paymentCurrentId = 1;
    this.settingsId = 1;
    
    // Initialize with default settings
    this.appSettings = {
      id: this.settingsId,
      defaultInterestRate: 2.0,
      defaultFrequency: "monthly",
      defaultInstallments: 12,
      currency: "R$"
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Borrower methods
  async getAllBorrowers(): Promise<Borrower[]> {
    return Array.from(this.borrowers.values());
  }

  async getBorrower(id: number): Promise<Borrower | undefined> {
    return this.borrowers.get(id);
  }

  async createBorrower(insertBorrower: InsertBorrower): Promise<Borrower> {
    const id = this.borrowerCurrentId++;
    const borrower: Borrower = { ...insertBorrower, id };
    this.borrowers.set(id, borrower);
    return borrower;
  }

  async updateBorrower(id: number, borrowerData: Partial<InsertBorrower>): Promise<Borrower | undefined> {
    const existingBorrower = this.borrowers.get(id);
    if (!existingBorrower) return undefined;

    const updatedBorrower = { ...existingBorrower, ...borrowerData };
    this.borrowers.set(id, updatedBorrower);
    return updatedBorrower;
  }

  async deleteBorrower(id: number): Promise<boolean> {
    return this.borrowers.delete(id);
  }

  // Loan methods
  async getAllLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getLoansByBorrowerId(borrowerId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.borrowerId === borrowerId
    );
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanCurrentId++;
    const loan: Loan = { ...insertLoan, id };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan | undefined> {
    const existingLoan = this.loans.get(id);
    if (!existingLoan) return undefined;

    const updatedLoan = { ...existingLoan, ...loanData };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }

  // Payment methods
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByLoanId(loanId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.loanId === loanId
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const payment: Payment = { ...insertPayment, id };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;

    const updatedPayment = { ...existingPayment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    return this.appSettings;
  }

  async updateSettings(settingsData: Partial<InsertSettings>): Promise<Settings> {
    if (!this.appSettings) {
      this.appSettings = {
        id: this.settingsId,
        defaultInterestRate: 2.0,
        defaultFrequency: "monthly",
        defaultInstallments: 12,
        currency: "R$",
        ...settingsData
      };
    } else {
      this.appSettings = { ...this.appSettings, ...settingsData };
    }
    return this.appSettings;
  }
}

export const storage = new MemStorage();
