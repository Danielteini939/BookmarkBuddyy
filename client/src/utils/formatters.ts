import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoanStatus } from '@/types';

/**
 * Format a date string to Brazilian format (dd/MM/yyyy)
 */
export function formatDate(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString;
  }
}

/**
 * Format a number as currency (R$ XX.XXX,XX)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage (XX,X%)
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Get the color for a loan status
 */
export function getStatusColor(status: LoanStatus): {
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'active':
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800',
      };
    case 'paid':
      return {
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
      };
    case 'overdue':
      return {
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
      };
    case 'defaulted':
      return {
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
      };
    default:
      return {
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-600 dark:text-slate-400',
        borderColor: 'border-slate-200 dark:border-slate-700',
      };
  }
}

/**
 * Get the display name for a loan status
 */
export function getStatusName(status: LoanStatus): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'paid':
      return 'Pago';
    case 'overdue':
      return 'Em Atraso';
    case 'defaulted':
      return 'Inadimplente';
    default:
      return status;
  }
}