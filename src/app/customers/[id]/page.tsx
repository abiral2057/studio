import { CustomerLedgerClient } from "@/components/customers/customer-ledger-client";
import { getCustomerById, getTransactionsByCustomerId } from "@/lib/data";
import { notFound } from "next/navigation";

export default function CustomerLedgerPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = getCustomerById(params.id);
  if (!customer) {
    notFound();
  }
  const transactions = getTransactionsByCustomerId(params.id);

  return <CustomerLedgerClient customer={customer} transactions={transactions} />;
}
