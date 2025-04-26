import React from "react";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
  setSidebarOpen: (open: boolean) => void;
};

const Header: React.FC<HeaderProps> = ({ title, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-600 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 lg:ml-0">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-600">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-600">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
