import React from "react";
import { Link } from "wouter";
import { PlusCircle, UserPlus, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        variant="outline"
        className="bg-white border border-slate-200 rounded-lg shadow p-4 h-auto flex items-center justify-center hover:bg-slate-50 transition"
        asChild
      >
        <Link href="/loans/new">
          <PlusCircle className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="font-medium text-slate-800">Novo Empréstimo</span>
        </Link>
      </Button>
      
      <Button
        variant="outline"
        className="bg-white border border-slate-200 rounded-lg shadow p-4 h-auto flex items-center justify-center hover:bg-slate-50 transition"
        asChild
      >
        <Link href="/borrowers/new">
          <UserPlus className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="font-medium text-slate-800">Novo Mutuário</span>
        </Link>
      </Button>
      
      <Button
        variant="outline"
        className="bg-white border border-slate-200 rounded-lg shadow p-4 h-auto flex items-center justify-center hover:bg-slate-50 transition"
        asChild
      >
        <Link href="/reports">
          <FileBarChart className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="font-medium text-slate-800">Gerar Relatório</span>
        </Link>
      </Button>
    </div>
  );
};

export default QuickActions;
