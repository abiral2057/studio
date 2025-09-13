
"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { DatePickerWithNepali } from "@/components/ui/date-picker-with-nepali";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import type { Customer, Transaction } from "@/lib/types";
import { suggestDescriptionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  date: z.date(),
  type: z.enum(["sale", "payment"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  description: z.string().min(1, "Description is required."),
  creditDays: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTransactionSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  customer: Customer;
  transaction: Transaction;
  onEditTransaction: (transactionData: Omit<Transaction, 'balanceAfter'>) => Promise<void>;
}

export function EditTransactionSheet({
  isOpen,
  setIsOpen,
  customer,
  transaction,
  onEditTransaction,
}: EditTransactionSheetProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(transaction.date),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      creditDays: transaction.creditDays ?? undefined,
    },
  });

  useEffect(() => {
    form.reset({
      date: new Date(transaction.date),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      creditDays: transaction.creditDays ?? undefined,
    });
  }, [transaction, form]);


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await onEditTransaction({
        ...transaction,
        date: values.date.toISOString(),
        type: values.type,
        amount: values.amount,
        description: values.description,
        creditDays: values.type === 'sale' ? values.creditDays || 0 : null,
      });
      setIsOpen(false);
    });
  };
  
  const handleSuggestDescription = async () => {
    const { amount, type, description } = form.getValues();
    if (!amount) {
      form.setError("amount", { message: "Amount is needed to suggest a description." });
      return;
    }
    
    setIsSuggesting(true);
    try {
      const result = await suggestDescriptionAction({
        amount,
        transactionType: type,
        customerName: customer.name,
        previousDescription: description,
      });

      if (result.success && result.description) {
        form.setValue("description", result.description);
      } else {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
          description: result.error,
        });
      }
    } catch(e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>
            Update the details for this transaction.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 space-y-4 overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                   <DatePickerWithNepali
                      value={field.value}
                      onChange={field.onChange}
                    />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sale" />
                        </FormControl>
                        <FormLabel className="font-normal">Sale</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="payment" />
                        </FormControl>
                        <FormLabel className="font-normal">Payment</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <Button type="button" variant="ghost" size="sm" onClick={handleSuggestDescription} disabled={isSuggesting || isPending}>
                        <Sparkles className={cn("mr-2 h-4 w-4", isSuggesting && "animate-spin")} />
                        {isSuggesting ? "Thinking..." : "Suggest"}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="e.g., Invoice #123, Rice bags" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {form.watch("type") === "sale" && (
              <FormField
                control={form.control}
                name="creditDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Days</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex-grow" />
            <SheetFooter className="mt-auto pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
