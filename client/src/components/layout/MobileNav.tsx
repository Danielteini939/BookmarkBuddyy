import { Link, useRoute } from "wouter";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  // Check if the current route matches the given pattern
  const isActive = (pattern: string) => {
    const [match] = useRoute(pattern);
    return match;
  };

  return (
    <div className="bg-white w-full border-t border-slate-200 fixed bottom-0 md:hidden z-50">
      <div className="flex justify-around">
        <NavItem
          href="/"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/")}
        />
        <NavItem
          href="/loans"
          icon={CreditCard}
          label="Empréstimos"
          active={isActive("/loans*")}
        />
        <NavItem
          href="/borrowers"
          icon={Users}
          label="Mutuários"
          active={isActive("/borrowers*")}
        />
        <NavItem
          href="/settings"
          icon={MoreHorizontal}
          label="Mais"
          active={isActive("/payments*") || isActive("/reports*") || isActive("/settings*")}
        />
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  active: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex flex-col items-center p-2",
          active ? "text-primary" : "text-slate-500"
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="text-xs">{label}</span>
      </a>
    </Link>
  );
}
