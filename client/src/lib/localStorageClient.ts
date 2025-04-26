import { BorrowerType, LoanType, PaymentType, AppSettings } from "@/types";

// Chaves para armazenar os dados no localStorage
const STORAGE_KEYS = {
  BORROWERS: 'loanbuddy_borrowers',
  LOANS: 'loanbuddy_loans',
  PAYMENTS: 'loanbuddy_payments',
  SETTINGS: 'loanbuddy_settings'
};

// Funções de leitura do localStorage
export function loadBorrowers(): BorrowerType[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BORROWERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar mutuários:', error);
    return [];
  }
}

export function loadLoans(): LoanType[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOANS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    return [];
  }
}

export function loadPayments(): PaymentType[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    return [];
  }
}

export function loadSettings(): AppSettings | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return null;
  }
}

// Funções de salvamento no localStorage
export function saveBorrowers(borrowers: BorrowerType[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify(borrowers));
  } catch (error) {
    console.error('Erro ao salvar mutuários:', error);
  }
}

export function saveLoans(loans: LoanType[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  } catch (error) {
    console.error('Erro ao salvar empréstimos:', error);
  }
}

export function savePayments(payments: PaymentType[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (error) {
    console.error('Erro ao salvar pagamentos:', error);
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

// Função para gerar IDs únicos
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Função para limpar todos os dados
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BORROWERS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
}