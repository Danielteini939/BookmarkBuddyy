import React from 'react';
import ReportGenerator from '@/components/reports/ReportGenerator';
import Layout from '@/components/layout/Layout';

export default function ReportsPage() {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <ReportGenerator />
      </div>
    </Layout>
  );
}