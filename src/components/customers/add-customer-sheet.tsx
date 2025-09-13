
"use client";

import { useTransition, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phone: z.string().min(1, "Phone is required."),
  address: z.string().optional(),
  creditLimit: z.coerce.number().int().min(0).optional(),
  defaultCreditDays: z.coerce.number().int().min(0).optional(),
  customerId: z.string().min(1, "Customer ID is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCustomerSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance'>) => Promise<void>;
}

export function AddCustomerSheet({
  isOpen,
  setIsOpen,
  onAddCustomer,
}: AddCustomerSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [generatedCustomerId, setGeneratedCustomerId] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      creditLimit: 0,
      defaultCreditDays: 0,
      customerId: '',
    },
  });

  useEffect(() => {
    // Generate customerId on the client to avoid hydration mismatch
    const newCustomerId = `CUST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setGeneratedCustomerId(newCustomerId);
    if(isOpen) {
      form.reset({
        name: "",
        phone: "",
        address: "",
        creditLimit: 0,
        defaultCreditDays: 0,
        customerId: newCustomerId,
      });
    }
  }, [isOpen, form]);


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await onAddCustomer({
        customerId: values.customerId,
        name: values.name,
        phone: values.phone,
        address: values.address || "",
        creditLimit: values.creditLimit || 0,
        defaultCreditDays: values.defaultCreditDays || 0,
      });
      setIsOpen(false);
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Customer</SheetTitle>
          <SheetDescription>
            Enter the details of the new customer.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 space-y-4 overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CUST-123" {...field} disabled/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 98xxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St, Kathmandu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creditLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Limit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultCreditDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Credit Days</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex-grow" />
            <SheetFooter className="mt-auto pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Customer"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
