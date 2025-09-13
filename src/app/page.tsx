import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getCustomers, getTransactions } from "@/lib/data";

export default function DashboardPage() {
  const customers = getCustomers();
  const transactions = getTransactions();

  return <DashboardClient customers={customers} transactions={transactions} />;
}
