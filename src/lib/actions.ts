'use server';

import {
  getSmartTransactionDescription,
  type SmartTransactionDescriptionInput,
} from '@/ai/flows/smart-transaction-descriptions';
import type { Customer, Transaction } from '@/lib/types';
import { readDb, writeDb, getCustomerById as getCustomerByIdData, getTransactionsByCustomerId as getTransactionsByCustomerIdData } from '@/lib/data';

export async function suggestDescriptionAction(
  input: SmartTransactionDescriptionInput
) {
  try {
    const result = await getSmartTransactionDescription(input);
    return {
      success: true,
      description: result.description,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate description.',
    };
  }
}

// Internal function, not exported as an action itself
const recalculateBalances = (customerId: string, db: ReturnType<typeof readDb>) => {
  const customerTransactions = db.transactions
    .filter(t => t.customerId === customerId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentBalance = 0;
  customerTransactions.forEach(tx => {
    const amount = tx.type === 'sale' ? tx.amount : -tx.amount;
    currentBalance += amount;
    tx.balanceAfter = currentBalance;
  });

  const customer = db.customers.find(c => c.id === customerId);
  if (customer) {
    customer.outstandingBalance = currentBalance;
  }
  
  return db;
};

export async function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance'>): Promise<Customer> {
  const db = readDb();
  const newCustomer: Customer = {
    ...customer,
    id: `CUST-${Date.now()}`,
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
  };
  db.customers.push(newCustomer);
  writeDb(db);
  return newCustomer;
};

export async function updateCustomer(updatedCustomer: Omit<Customer, 'outstandingBalance' | 'createdAt'>): Promise<Customer> {
  const db = readDb();
  const index = db.customers.findIndex(c => c.id === updatedCustomer.id);
  if (index !== -1) {
    db.customers[index] = { ...db.customers[index], ...updatedCustomer };
    writeDb(db);
    return db.customers[index];
  }
  throw new Error("Customer not found");
};

export async function deleteCustomer(id: string): Promise<{ success: boolean }> {
  const db = readDb();
  const index = db.customers.findIndex(c => c.id === id);
  if (index !== -1) {
    db.customers.splice(index, 1);
    db.transactions = db.transactions.filter(t => t.customerId !== id);
    writeDb(db);
    return { success: true };
  } else {
    throw new Error("Customer not found");
  }
};

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'balanceAfter' | 'status'>): Promise<Transaction> {
  let db = readDb();
  const newTransaction: Transaction = {
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    balanceAfter: 0, // Will be recalculated
    dueDate: transaction.type === 'sale' ? new Date(new Date(transaction.date).getTime() + (transaction.creditDays || 0) * 24 * 60 * 60 * 1000).toISOString() : null,
    status: transaction.type === 'payment' ? 'paid' : 'due',
  };
  
  db.transactions.push(newTransaction);
  db = recalculateBalances(transaction.customerId, db);
  writeDb(db);
  
  const finalTransaction = db.transactions.find(t => t.id === newTransaction.id)!;
  return finalTransaction;
}

export async function updateTransaction(updatedTransaction: Omit<Transaction, 'balanceAfter'>): Promise<Transaction> {
  let db = readDb();
  const index = db.transactions.findIndex(t => t.id === updatedTransaction.id);
  if (index !== -1) {
     db.transactions[index] = {
      ...db.transactions[index],
      ...updatedTransaction,
      dueDate: updatedTransaction.type === 'sale' ? new Date(new Date(updatedTransaction.date).getTime() + (updatedTransaction.creditDays || 0) * 24 * 60 * 60 * 1000).toISOString() : null,
     };
     db = recalculateBalances(updatedTransaction.customerId, db);
     writeDb(db);
     const finalTransaction = db.transactions.find(t => t.id === updatedTransaction.id)!;
     return finalTransaction;
  }
  throw new Error("Transaction not found");
}

export async function deleteTransaction(id: string): Promise<{ success: boolean }> {
  let db = readDb();
  const index = db.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    const customerId = db.transactions[index].customerId;
    db.transactions.splice(index, 1);
    db = recalculateBalances(customerId, db);
    writeDb(db);
    return { success: true };
  } else {
    throw new Error("Transaction not found");
  }
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return getCustomerByIdData(id);
}

export async function getTransactionsByCustomerId(customerId: string): Promise<Transaction[]> {
  return getTransactionsByCustomerIdData(customerId);
}
