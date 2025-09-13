
"use client";

import { useState, useTransition } from "react";
import type { Customer, Transaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FilePenLine,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { AddTransactionSheet } from "./add-transaction-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { addTransaction, deleteTransaction, updateTransaction, getCustomerById, getTransactionsByCustomerId } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditTransactionSheet } from "./edit-transaction-sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerLedgerClientProps {
  customer: Customer;
  transactions: Transaction[];
}

export function CustomerLedgerClient({
  customer: initialCustomer,
  transactions: initialTransactions,
}: CustomerLedgerClientProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const refreshData = () => {
    startTransition(async () => {
      try {
        const updatedCustomer = await getCustomerById(customer.id);
        const updatedTransactions = await getTransactionsByCustomerId(customer.id);
        if (updatedCustomer) setCustomer(updatedCustomer);
        setTransactions(updatedTransactions);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to refresh data.",
        });
      }
    });
  };
  
  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'balanceAfter' | 'status'>) => {
    await addTransaction(transactionData);
    refreshData();
    toast({ title: "Success", description: "Transaction added." });
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, 'balanceAfter'>) => {
    await updateTransaction(transactionData);
    refreshData();
    toast({ title: "Success", description: "Transaction updated." });
  };
  
  const handleDeleteTransaction = () => {
    if(transactionToDelete) {
      startTransition(async () => {
        try {
          await deleteTransaction(transactionToDelete.id);
          refreshData();
          toast({ title: "Success", description: "Transaction deleted." });
        } catch (e) {
           toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete transaction.",
          });
        } finally {
          setTransactionToDelete(null);
        }
      });
    }
  };

  const openEditSheet = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsEditSheetOpen(true);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (transaction: Transaction) =>
    transaction.dueDate &&
    new Date(transaction.dueDate) < new Date() &&
    transaction.status !== "paid";

  return (
    <div className="flex flex-col h-full">
      <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 text-center truncate">
            <h1 className="text-xl font-bold truncate">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">
              {customer.customerId}
            </p>
          </div>
          <div className="w-10 flex-shrink-0">
            {/* Placeholder for alignment */}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Outstanding</p>
             {isPending ? <Skeleton className="h-7 w-32 mx-auto" /> :
              <p className="text-lg font-bold text-destructive">
                {formatCurrency(customer.outstandingBalance)}
              </p>
            }
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Credit Limit</p>
            {isPending ? <Skeleton className="h-7 w-32 mx-auto" /> :
              <p className="text-lg font-bold">
                {formatCurrency(customer.creditLimit)}
              </p>
            }
          </div>
        </div>
      </header>
      <main className="flex-1 p-2 sm:p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              A record of all sales and payments for this customer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`${isPending ? "opacity-50" : ""} mobile-table-container`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Balance</TableHead>
                     <TableHead className="w-[50px] text-right"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending && transactions.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2 mt-1" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                           <div className="font-medium truncate max-w-[140px] sm:max-w-xs">{tx.description}</div>
                           <div className="text-sm text-muted-foreground">{formatDate(tx.date)}</div>
                           {isOverdue(tx) && <Badge variant="destructive" className="mt-1">Overdue</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                           <div className={`font-mono font-semibold ${tx.type === 'sale' ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(tx.amount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono hidden md:table-cell">
                          {formatCurrency(tx.balanceAfter)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isPending}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => openEditSheet(tx)}>
                                <FilePenLine className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onSelect={() => setTransactionToDelete(tx)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 border-t sticky bottom-0 bg-background">
        <Button className="w-full" size="lg" onClick={() => setIsAddSheetOpen(true)} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
          {isPending ? 'Processing...' : 'Add Transaction'}
        </Button>
      </footer>
      <AddTransactionSheet
        isOpen={isAddSheetOpen}
        setIsOpen={setIsAddSheetOpen}
        customer={customer}
        onAddTransaction={handleAddTransaction}
      />
      {transactionToEdit && (
        <EditTransactionSheet
          isOpen={isEditSheetOpen}
          setIsOpen={setIsEditSheetOpen}
          customer={customer}
          transaction={transactionToEdit}
          onEditTransaction={handleEditTransaction}
        />
      )}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
