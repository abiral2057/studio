import { CustomerListClient } from "@/components/customers/customer-list-client";
import { getCustomers } from "@/lib/data";

export default function CustomersPage() {
  const customers = getCustomers();

  return <CustomerListClient customers={customers} />;
}
