import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoanStatusChartProps {
  activeLoans: number;
  paidLoans: number;
  overdueLoans: number;
  defaultedLoans: number;
  totalLoans: number;
  totalBorrowers: number;
}

const LoanStatusChart: React.FC<LoanStatusChartProps> = ({
  activeLoans,
  paidLoans,
  overdueLoans,
  defaultedLoans,
  totalLoans,
  totalBorrowers,
}) => {
  // Calculate percentages
  const total = activeLoans + paidLoans + overdueLoans + defaultedLoans;
  const activePercent = total > 0 ? Math.round((activeLoans / total) * 100) : 0;
  const paidPercent = total > 0 ? Math.round((paidLoans / total) * 100) : 0;
  const overduePercent = total > 0 ? Math.round((overdueLoans / total) * 100) : 0;
  const defaultedPercent = total > 0 ? Math.round((defaultedLoans / total) * 100) : 0;

  const statusItems = [
    {
      label: "Ativos",
      percent: activePercent,
      bgPrimary: "bg-emerald-500",
      bgSecondary: "bg-emerald-100",
    },
    {
      label: "Pagos",
      percent: paidPercent,
      bgPrimary: "bg-blue-500",
      bgSecondary: "bg-blue-100",
    },
    {
      label: "Vencidos",
      percent: overduePercent,
      bgPrimary: "bg-amber-500",
      bgSecondary: "bg-amber-100",
    },
    {
      label: "Inadimplentes",
      percent: defaultedPercent,
      bgPrimary: "bg-red-500",
      bgSecondary: "bg-red-100",
    },
  ];

  return (
    <Card className="border border-slate-200">
      <CardHeader className="p-5 border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Status dos Empréstimos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-60 flex items-center justify-center">
          <div className="flex items-center justify-around h-full w-full">
            {statusItems.map((item, index) => (
              <div key={index} className="text-center flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${item.bgSecondary}`}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${item.bgPrimary} flex items-center justify-center text-white`}
                  >
                    {item.percent}%
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-700">
              Total de Empréstimos
            </p>
            <p className="text-lg font-semibold text-slate-800 mt-1">
              {totalLoans}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-700">
              Total de Mutuários
            </p>
            <p className="text-lg font-semibold text-slate-800 mt-1">
              {totalBorrowers}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanStatusChart;
