import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export const StatusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-blue-100 text-blue-800',
  overdue: 'bg-amber-100 text-amber-800',
  defaulted: 'bg-red-100 text-red-800',
};

export function generateInitials(name: string): string {
  if (!name) return '';
  
  const nameParts = name.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

export function downloadCSV(data: any[], filename: string): void {
  // Convert data array to CSV string
  const replacer = (_: any, value: any) => value === null ? '' : value;
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\r\n');
        const headers = lines[0].split(',').map(header => 
          header.replace(/^"/, '').replace(/"$/, '')
        );
        
        const result = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',');
          const obj: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            let value = values[index]?.replace(/^"/, '').replace(/"$/, '') || '';
            // Try to convert to number or other types as needed
            if (!isNaN(Number(value))) {
              obj[header] = Number(value);
            } else if (value === 'true') {
              obj[header] = true;
            } else if (value === 'false') {
              obj[header] = false;
            } else {
              obj[header] = value;
            }
          });
          
          return obj;
        });
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
