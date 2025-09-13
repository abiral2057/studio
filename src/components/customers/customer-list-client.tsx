
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Customer } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddCustomerSheet } from "./add-customer-sheet";
import { getCustomers, saveCustomers } from "@/lib/data";

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

  useEffect(() => {
    // This could be used to refetch data if it was coming from an API
  }, [customers]);

  const handleAddCustomer = (newCustomer: Customer) => {
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers); // Persist to our mock DB
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
    return names[0].substring(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1">
      <Header title="Customers" actionButton={{ label: "Add Customer", onClick: () => setIsAddCustomerSheetOpen(true) }} />
      <div className="p-4 md:p-6">
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
                />
              </div>
              <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="limitExceeded">Limit</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.customerId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={customer.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}>
                          {formatCurrency(customer.outstandingBalance)}
                        </span>
                      </TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/customers/${customer.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
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
          </CardContent>
        </Card>
      </div>
       <AddCustomerSheet
        isOpen={isAddCustomerSheetOpen}
        setIsOpen={setIsAddCustomerSheetOpen}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
}
