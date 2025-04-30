import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoan } from "@/context/LoanContext";

// This component will use Chart.js for visualization
export default function LoanStatusChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const { loans } = useLoan();

  useEffect(() => {
    if (!chartRef.current) return;

    // Import Chart.js dynamically to avoid SSR issues
    const loadChart = async () => {
      const Chart = (await import("chart.js/auto")).default;

      // If a chart already exists, destroy it
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Contar empréstimos por status
      const activeLoanCount = loans.filter(loan => loan.status === 'active').length;
      const paidLoanCount = loans.filter(loan => loan.status === 'paid').length;
      const overdueLoanCount = loans.filter(loan => loan.status === 'overdue').length;
      const defaultedLoanCount = loans.filter(loan => loan.status === 'defaulted').length;
      
      console.log("Status counts for chart:", {
        active: activeLoanCount,
        paid: paidLoanCount,
        overdue: overdueLoanCount,
        defaulted: defaultedLoanCount
      });

      // Verificar se o canvas existe
      if (!chartRef.current) return;
      
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      // Usar um gráfico de barras simples para mostrar o status atual
      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Ativos", "Pagos", "Vencidos", "Inadimplentes"],
          datasets: [
            {
              label: "Empréstimos",
              data: [activeLoanCount, paidLoanCount, overdueLoanCount, defaultedLoanCount],
              backgroundColor: [
                "rgba(59, 130, 246, 0.7)",   // Azul para ativos
                "rgba(16, 185, 129, 0.7)",   // Verde para pagos
                "rgba(245, 158, 11, 0.7)",   // Âmbar para vencidos
                "rgba(239, 68, 68, 0.7)",    // Vermelho para inadimplentes
              ],
              borderColor: [
                "rgb(59, 130, 246)",
                "rgb(16, 185, 129)",
                "rgb(245, 158, 11)",
                "rgb(239, 68, 68)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false, // Ocultar a legenda pois é redundante com as labels do eixo X
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y || 0;
                  return `${value} empréstimo(s)`;
                }
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                stepSize: 1, // Forçar incrementos inteiros
              },
            },
          },
        },
      });
    };

    loadChart();

    // Clean up chart instance on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [loans]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Empréstimos por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
