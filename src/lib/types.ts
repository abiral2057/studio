export type Customer = {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  outstandingBalance: number;
  defaultCreditDays: number;
  createdAt: string;
};

export type Transaction = {
  id: string;
  customerId: string;
  date: string;
  type: "sale" | "payment";
  amount: number;
  description: string;
  creditDays: number | null;
  dueDate: string | null;
  balanceAfter: number;
  status: "paid" | "due" | "overdue";
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
};
