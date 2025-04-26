import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  // Set page title based on current route
  useEffect(() => {
    const getPageTitle = () => {
      if (location === "/") return "Dashboard";
      if (location.startsWith("/loans")) {
        if (location === "/loans") return "Empréstimos";
        if (location.includes("/new")) return "Novo Empréstimo";
        if (location.includes("/edit")) return "Editar Empréstimo";
        return "Detalhes do Empréstimo";
      }
      if (location.startsWith("/borrowers")) {
        if (location === "/borrowers") return "Mutuários";
        if (location.includes("/new")) return "Novo Mutuário";
        return "Editar Mutuário";
      }
      if (location === "/payments") return "Pagamentos";
      if (location === "/reports") return "Relatórios";
      if (location === "/settings") return "Configurações";
      return "Dashboard";
    };

    setPageTitle(getPageTitle());
  }, [location]);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
