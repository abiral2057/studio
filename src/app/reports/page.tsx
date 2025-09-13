import { ReportsClient } from "@/components/reports/reports-client";
import { getCustomers, getTransactions } from "@/lib/data";

export default function ReportsPage() {
  const customers = getCustomers();
  const transactions = getTransactions();

  return <ReportsClient customers={customers} transactions={transactions} />;
}
