
"use client";

import { useState, useMemo, useTransition } from "react";
import type { Customer } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ArrowRight, MoreVertical, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { AddCustomerSheet } from "./add-customer-sheet";
import { addCustomer, deleteCustomer, getCustomers } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerListClientProps {
  customers: Customer[];
}

export function CustomerListClient({
  customers: initialCustomers,
}: CustomerListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [customers, setCustomers] = useState(initialCustomers);
  const [isAddCustomerSheetOpen, setIsAddCustomerSheetOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const refreshCustomers = () => {
    startTransition(async () => {
      const updatedCustomers = await getCustomers();
      setCustomers(updatedCustomers);
    });
  };

  const handleAddCustomer = async (newCustomerData: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance'>) => {
    await addCustomer(newCustomerData);
    refreshCustomers();
    toast({ title: "Success", description: "Customer added." });
  };

  const handleDeleteCustomer = () => {
    if (customerToDelete) {
      startTransition(async () => {
        try {
          await deleteCustomer(customerToDelete.id);
          refreshCustomers();
          toast({ title: "Success", description: "Customer deleted." });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete customer.",
          });
        } finally {
          setCustomerToDelete(null);
        }
      });
    }
  };
  
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        if (filter === "overdue") {
          return customer.outstandingBalance > 0;
        }
        if (filter === "limitExceeded") {
          return customer.outstandingBalance > customer.creditLimit && customer.creditLimit > 0;
        }
        return true;
      })
      .filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [customers, searchTerm, filter]);
  
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <Header title="Customers" actionButton={{ label: "Add Customer", onClick: () => setIsAddCustomerSheetOpen(true) }} />
      <div className="mt-4 md:mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                  <TabsTrigger value="all" disabled={isPending}>All</TabsTrigger>
                  <TabsTrigger value="overdue" disabled={isPending}>Overdue</TabsTrigger>
                  <TabsTrigger value="limitExceeded" disabled={isPending}>Limit</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`${isPending ? 'opacity-50' : ''} mobile-table-container`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                     Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-4 w-16 mt-1" />
                            </div>
                          </div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-28" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </TableCell>
                         <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Link href={`/customers/${customer.id}`}>
                            <div className="flex items-center gap-3 hover:underline">
                              <Avatar>
                                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium truncate max-w-[120px] sm:max-w-xs">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.customerId}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={customer.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}>
                            {formatCurrency(customer.outstandingBalance)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isPending}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => router.push(`/customers/${customer.id}`)}>
                                <ArrowRight className="mr-2 h-4 w-4" /> View Ledger
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onSelect={() => setCustomerToDelete(customer)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Customer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
       <AddCustomerSheet
        isOpen={isAddCustomerSheetOpen}
        setIsOpen={setIsAddCustomerSheetOpen}
        onAddCustomer={handleAddCustomer}
      />
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer and all their associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
