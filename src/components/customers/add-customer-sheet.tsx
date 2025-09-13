
"use client";

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

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phone: z.string().min(1, "Phone is required."),
  address: z.string().optional(),
  creditLimit: z.coerce.number().int().min(0).optional(),
  defaultCreditDays: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCustomerSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddCustomer: (customer: Customer) => void;
}

export function AddCustomerSheet({
  isOpen,
  setIsOpen,
  onAddCustomer,
}: AddCustomerSheetProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      creditLimit: 0,
      defaultCreditDays: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const newCustomer: Customer = {
      id: new Date().toISOString(),
      customerId: `CUST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: values.name,
      phone: values.phone,
      address: values.address || "",
      creditLimit: values.creditLimit || 0,
      outstandingBalance: 0,
      defaultCreditDays: values.defaultCreditDays || 0,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCustomer);
    form.reset();
    setIsOpen(false);
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
            <SheetFooter className="mt-auto pt-4">
              <Button type="submit" className="w-full">Save Customer</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
