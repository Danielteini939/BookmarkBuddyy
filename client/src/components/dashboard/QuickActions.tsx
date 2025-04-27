import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CalendarPlus, 
  Users, 
  FilePlus, 
  BarChart3,
  FileText,
  Download,
  Upload
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      icon: FilePlus,
      label: "Novo Empréstimo",
      href: "/loans/new",
      color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: Users,
      label: "Novo Mutuário",
      href: "/borrowers/new",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      icon: CalendarPlus,
      label: "Registrar Pagamento",
      href: "/payments",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      icon: BarChart3,
      label: "Relatórios",
      href: "/reports",
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
    },
    {
      icon: Download,
      label: "Exportar Dados",
      href: "/settings",
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
    },
    {
      icon: Upload,
      label: "Importar Dados",
      href: "/settings",
      color: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          asChild
          variant="ghost"
          className="h-auto flex-col gap-2 p-4 justify-start items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Link href={action.href}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}