import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

/**
 * Format a number as currency (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format a date string in Brazilian format (dd/MM/yyyy)
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  
  return format(date, "dd/MM/yyyy", { locale: pt });
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Get CSS classes for loan status badge
 */
export function getStatusBadgeClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "overdue":
      return "bg-amber-100 text-amber-800";
    case "defaulted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Format a status string with proper capitalization
 */
export function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "Ativo";
    case "paid":
      return "Pago";
    case "overdue":
      return "Vencido";
    case "defaulted":
      return "Inadimplente";
    default:
      return status;
  }
}

/**
 * Format payment frequency
 */
export function formatFrequency(frequency: string): string {
  switch (frequency.toLowerCase()) {
    case "weekly":
      return "Semanal";
    case "biweekly":
      return "Quinzenal";
    case "monthly":
      return "Mensal";
    case "quarterly":
      return "Trimestral";
    case "yearly":
      return "Anual";
    case "custom":
      return "Personalizado";
    default:
      return frequency;
  }
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  const parts = name.split(" ");
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format days remaining or overdue
 */
export function formatDaysText(days: number, isOverdue: boolean): string {
  if (isOverdue) {
    return `${days} ${days === 1 ? "dia" : "dias"} em atraso`;
  } else {
    return `${days} ${days === 1 ? "dia" : "dias"} restantes`;
  }
}
