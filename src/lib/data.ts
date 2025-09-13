import type { Customer, Transaction } from "@/lib/types";

// In-memory "database" to simulate persistence during user session.
// This will reset on server restart.

let DB = {
  customers: [
    {
      id: "1",
      customerId: "CUST-001",
      name: "Aarav Sharma",
      phone: "9876543210",
      address: "123 Main St, Kathmandu",
      creditLimit: 50000,
      outstandingBalance: 15500,
      defaultCreditDays: 30,
      createdAt: "2023-01-15T10:00:00Z",
    },
    {
      id: "2",
      customerId: "CUST-002",
      name: "Bina Rai",
      phone: "9876543211",
      address: "456 Market Rd, Pokhara",
      creditLimit: 25000,
      outstandingBalance: -5000,
      defaultCreditDays: 15,
      createdAt: "2023-02-20T11:30:00Z",
    },
    {
      id: "3",
      customerId: "CUST-003",
      name: "Chandan Gupta",
      phone: "9876543212",
      address: "789 Temple Ave, Lalitpur",
      creditLimit: 100000,
      outstandingBalance: 75000,
      defaultCreditDays: 45,
      createdAt: "2023-03-10T09:00:00Z",
    },
    {
      id: "4",
      customerId: "CUST-004",
      name: "Dolma Sherpa",
      phone: "9876543213",
      address: "101 Mountain View, Lukla",
      creditLimit: 10000,
      outstandingBalance: 0,
      defaultCreditDays: 0,
      createdAt: "2023-04-05T14:00:00Z",
    },
    {
      id: "5",
      customerId: "CUST-005",
      name: "Eshwar Yadav",
      phone: "9876543214",
      address: "212 Terai Path, Birgunj",
      creditLimit: 40000,
      outstandingBalance: 42000, // Over limit
      defaultCreditDays: 20,
      createdAt: "2023-05-01T16:45:00Z",
    },
  ] as Customer[],
  transactions: [
    // Transactions for Aarav Sharma (CUST-001)
    {
      id: "t1",
      customerId: "1",
      date: "2023-10-01T10:00:00Z",
      type: "sale",
      amount: 10000,
      description: "Initial stock purchase",
      creditDays: 30,
      dueDate: "2023-10-31T10:00:00Z", // Overdue
      balanceAfter: 10000,
      status: "due",
    },
    {
      id: "t2",
      customerId: "1",
      date: "2023-10-15T12:00:00Z",
      type: "sale",
      amount: 7500,
      description: "Follow-up order",
      creditDays: 30,
      dueDate: "2023-11-14T12:00:00Z", // Overdue
      balanceAfter: 17500,
      status: "due",
    },
    {
      id: "t3",
      customerId: "1",
      date: "2023-11-05T09:30:00Z",
      type: "payment",
      amount: 2000,
      description: "Partial payment",
      creditDays: null,
      dueDate: null,
      balanceAfter: 15500,
      status: "paid",
    },

    // Transactions for Bina Rai (CUST-002)
    {
      id: "t4",
      customerId: "2",
      date: "2023-11-01T14:00:00Z",
      type: "sale",
      amount: 5000,
      description: "Handicrafts order",
      creditDays: 15,
      dueDate: "2023-11-16T14:00:00Z", // Overdue
      balanceAfter: 5000,
      status: "due",
    },
    {
      id: "t5",
      customerId: "2",
      date: "2023-11-10T11:00:00Z",
      type: "payment",
      amount: 10000,
      description: "Advance for next order",
      creditDays: null,
      dueDate: null,
      balanceAfter: -5000,
      status: "paid",
    },

    // Transactions for Chandan Gupta (CUST-003)
    {
      id: "t6",
      customerId: "3",
      date: "2024-05-01T10:00:00Z",
      type: "sale",
      amount: 50000,
      description: "Electronics parts",
      creditDays: 45,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      balanceAfter: 50000,
      status: "due",
    },
    {
      id: "t7",
      customerId: "3",
      date: "2024-05-20T15:00:00Z",
      type: "sale",
      amount: 25000,
      description: "Additional components",
      creditDays: 45,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      balanceAfter: 75000,
      status: "due",
    },

    // Transactions for Eshwar Yadav (CUST-005)
    {
      id: "t8",
      customerId: "5",
      date: "2024-04-10T09:00:00Z",
      type: "sale",
      amount: 42000,
      description: "Bulk textile order",
      creditDays: 20,
      dueDate: "2024-04-30T09:00:00Z", // Overdue
      balanceAfter: 42000,
      status: "due",
    },
  ] as Transaction[],
};

const recalculateBalances = (customerId: string) => {
  const customerTransactions = DB.transactions
    .filter(t => t.customerId === customerId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentBalance = 0;
  customerTransactions.forEach(tx => {
    const amount = tx.type === 'sale' ? tx.amount : -tx.amount;
    currentBalance += amount;
    tx.balanceAfter = currentBalance;
  });

  const customer = DB.customers.find(c => c.id === customerId);
  if (customer) {
    customer.outstandingBalance = currentBalance;
  }
};


// Functions to interact with the in-memory DB
// This ensures that components always get the latest data.

export const getCustomers = (): Customer[] => {
  return JSON.parse(JSON.stringify(DB.customers));
};

export const getCustomerById = (id: string): Customer | undefined => {
  const customer = DB.customers.find((c) => c.id === id);
  return customer ? JSON.parse(JSON.stringify(customer)) : undefined;
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance'>): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: `CUST-${Date.now()}`,
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
  };
  DB.customers.push(newCustomer);
  return JSON.parse(JSON.stringify(newCustomer));
};

export const updateCustomer = (updatedCustomer: Omit<Customer, 'outstandingBalance' | 'createdAt'>): Customer => {
  const index = DB.customers.findIndex(c => c.id === updatedCustomer.id);
  if (index !== -1) {
    DB.customers[index] = { ...DB.customers[index], ...updatedCustomer };
    return JSON.parse(JSON.stringify(DB.customers[index]));
  }
  throw new Error("Customer not found");
};

export const deleteCustomer = (id: string): void => {
  const index = DB.customers.findIndex(c => c.id === id);
  if (index !== -1) {
    DB.customers.splice(index, 1);
    DB.transactions = DB.transactions.filter(t => t.customerId !== id);
  } else {
    throw new Error("Customer not found");
  }
};


export const getTransactions = (): Transaction[] => {
  return JSON.parse(JSON.stringify(DB.transactions));
};

export const getTransactionsByCustomerId = (customerId: string): Transaction[] => {
  return DB.transactions
    .filter((t) => t.customerId === customerId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'balanceAfter' | 'status'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    balanceAfter: 0, // Will be recalculated
    dueDate: transaction.type === 'sale' ? new Date(new Date(transaction.date).getTime() + (transaction.creditDays || 0) * 24 * 60 * 60 * 1000).toISOString() : null,
    status: transaction.type === 'payment' ? 'paid' : 'due',
  };
  
  DB.transactions.push(newTransaction);
  recalculateBalances(transaction.customerId);
  
  const finalTransaction = DB.transactions.find(t => t.id === newTransaction.id)!;
  return JSON.parse(JSON.stringify(finalTransaction));
}

export const updateTransaction = (updatedTransaction: Omit<Transaction, 'balanceAfter'>): Transaction => {
  const index = DB.transactions.findIndex(t => t.id === updatedTransaction.id);
  if (index !== -1) {
     DB.transactions[index] = {
      ...DB.transactions[index],
      ...updatedTransaction,
      dueDate: updatedTransaction.type === 'sale' ? new Date(new Date(updatedTransaction.date).getTime() + (updatedTransaction.creditDays || 0) * 24 * 60 * 60 * 1000).toISOString() : null,
     };
     recalculateBalances(updatedTransaction.customerId);
     const finalTransaction = DB.transactions.find(t => t.id === updatedTransaction.id)!;
     return JSON.parse(JSON.stringify(finalTransaction));
  }
  throw new Error("Transaction not found");
}

export const deleteTransaction = (id: string): void => {
  const index = DB.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    const customerId = DB.transactions[index].customerId;
    DB.transactions.splice(index, 1);
    recalculateBalances(customerId);
  } else {
    throw new Error("Transaction not found");
  }
}
