import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Icons
import {
  LayoutDashboard,
  CreditCard,
  Users,
  DollarSign,
  FileBarChart,
  Settings,
} from "lucide-react";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Empréstimos",
      href: "/loans",
      icon: <CreditCard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Mutuários",
      href: "/borrowers",
      icon: <Users className="mr-3 h-5 w-5" />,
    },
    {
      name: "Pagamentos",
      href: "/payments",
      icon: <DollarSign className="mr-3 h-5 w-5" />,
    },
    {
      name: "Relatórios",
      href: "/reports",
      icon: <FileBarChart className="mr-3 h-5 w-5" />,
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-600 bg-opacity-75 lg:hidden transition-opacity duration-200",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-primary-800 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-900">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-emerald-500 mr-2" />
              <span className="text-xl font-semibold">LoanBuddy</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md group transition-colors",
                    isActive(item.href)
                      ? "bg-primary-700 text-white"
                      : "text-primary-100 hover:bg-primary-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-primary-700">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-primary-700 flex items-center justify-center text-emerald-500">
                <span className="text-sm font-medium">AB</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-slate-400">admin@loanbuddy.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
