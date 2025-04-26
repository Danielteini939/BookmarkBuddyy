import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import {
  DollarSign,
  Percent,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface DashboardCardsProps {
  totalLent: number;
  totalInterest: number;
  totalOverdue: number;
  totalToReceive: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  totalLent,
  totalInterest,
  totalOverdue,
  totalToReceive,
}) => {
  const cards = [
    {
      title: "Total Emprestado",
      value: formatCurrency(totalLent),
      icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
      change: 12,
      changeText: "desde o mês passado",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Juros Acumulados",
      value: formatCurrency(totalInterest),
      icon: <Percent className="h-6 w-6 text-blue-500" />,
      change: 8,
      changeText: "desde o mês passado",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Em Atraso",
      value: formatCurrency(totalOverdue),
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      change: 3,
      changeText: "desde o mês passado",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "A Receber (Total)",
      value: formatCurrency(totalToReceive),
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
      change: -2,
      changeText: "desde o mês passado",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="text-2xl font-semibold text-slate-800">
                  {card.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 ${card.bgColor} rounded-full flex items-center justify-center`}
              >
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span
                className={`flex items-center ${
                  card.change >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {card.change >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(card.change)}%
              </span>
              <span className="text-slate-500 ml-2">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
