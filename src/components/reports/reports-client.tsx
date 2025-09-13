
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import type { Customer, Transaction } from "@/lib/types";

interface ReportsClientProps {
  customers: Customer[];
  transactions: Transaction[];
}

export function ReportsClient({ customers, transactions }: ReportsClientProps) {
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);

  const handleExport = (format: "csv" | "json") => {
    let data: any[] = [];
    if (includeCustomers) data = [...data, ...customers];
    if (includeTransactions) data = [...data, ...transactions];
    
    if (data.length === 0) {
      alert("Please select at least one data type to export.");
      return;
    }

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      fileExtension = "json";
    } else {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => JSON.stringify(row[header] || '')).join(',')
        )
      ];
      content = csvRows.join('\n');
      mimeType = "text/csv";
      fileExtension = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khaatabook_export_${new Date().toISOString()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <Header title="Reports & Export" />
      <div className="mt-4 md:mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download your customer and transaction data in various formats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Select Data to Export</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-customers"
                  checked={includeCustomers}
                  onCheckedChange={(checked) =>
                    setIncludeCustomers(Boolean(checked))
                  }
                />
                <Label htmlFor="include-customers">Customers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-transactions"
                  checked={includeTransactions}
                  onCheckedChange={(checked) =>
                    setIncludeTransactions(Boolean(checked))
                  }
                />
                <Label htmlFor="include-transactions">Transactions</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Choose Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleExport("csv")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Export as CSV
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleExport("json")}
                >
                  <FileJson className="mr-2 h-5 w-5" />
                  Export as JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
