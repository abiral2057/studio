
"use client";

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
import {
  AlertCircle,
  Users,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "../ui/button";
import { Header } from "@/components/layout/header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardClientProps {
  customers: Customer[];
  transactions: Transaction[];
}

export function DashboardClient({
  customers,
  transactions,
}: DashboardClientProps) {
  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + customer.outstandingBalance,
    0
  );
  const customersWithBalance = customers
    .filter((c) => c.outstandingBalance > 0)
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance);

  const topCustomers = customersWithBalance.slice(0, 5);

  const chartData = topCustomers.map(c => ({
    name: c.name.split(' ')[0], // Use first name for brevity
    balance: c.outstandingBalance,
  }));
  
  const chartConfig = {
    balance: {
      label: "Balance",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  const overdueTransactions = transactions.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "paid"
  );
  const overdueCustomerIds = new Set(
    overdueTransactions.map((t) => t.customerId)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex-1">
      <Header title="Dashboard" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                Total customers managed
              </p>
            </CardContent>
          </Card>
        </div>
        
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Outstanding Balances</CardTitle>
              <CardDescription>
                Highest outstanding balances by customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={50}
                    fontSize={12}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="balance" fill="var(--color-balance)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}


        {overdueTransactions.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Overdue Transactions</AlertTitle>
            <AlertDescription>
              You have {overdueTransactions.length} overdue transactions. Please
              follow up with the customers.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
            <CardDescription>A list of customers with pending payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mobile-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right w-[50px]">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersWithBalance.length > 0 ? (
                    customersWithBalance.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[120px] sm:max-w-xs">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.customerId}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(customer.outstandingBalance)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col items-start gap-1">
                            {overdueCustomerIds.has(customer.id) && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                            {customer.outstandingBalance >
                              customer.creditLimit && customer.creditLimit > 0 && (
                              <Badge variant="destructive">
                                Limit
                              </Badge>
                            )}
                          </div>
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
                      <TableCell colSpan={4} className="text-center">
                        No outstanding balances.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
