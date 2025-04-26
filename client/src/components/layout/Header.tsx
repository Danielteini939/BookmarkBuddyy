import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoan } from "@/context/LoanContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [location] = useLocation();
  const pageTitle = getPageTitle(location);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2 text-slate-500"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-sm font-medium">JD</span>
            </div>
            <span className="ml-2 text-sm font-medium text-slate-700 hidden sm:block">
              João Silva
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Helper function to get the page title based on the current route
function getPageTitle(path: string): string {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/loans")) return "Empréstimos";
  if (path.startsWith("/borrowers")) return "Mutuários";
  if (path.startsWith("/payments")) return "Pagamentos";
  if (path.startsWith("/reports")) return "Relatórios";
  if (path.startsWith("/settings")) return "Configurações";
  return "LoanBuddy";
}
