import React from "react";
import { useLoanContext } from "@/context/LoanContext";
import ReportGenerator from "@/components/reports/ReportGenerator";

const ReportsPage: React.FC = () => {
  const {
    borrowers,
    loans,
    payments,
    exportDataToCSV,
    importDataFromCSV,
  } = useLoanContext();

  return (
    <div>
      <ReportGenerator
        borrowers={borrowers}
        loans={loans}
        payments={payments}
        exportData={exportDataToCSV}
        importData={importDataFromCSV}
      />
    </div>
  );
};

export default ReportsPage;
