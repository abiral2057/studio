'use server';

/**
 * @fileOverview Provides AI-suggested transaction descriptions based on transaction type and amount.
 *
 * - getSmartTransactionDescription - A function that generates a smart transaction description.
 * - SmartTransactionDescriptionInput - The input type for the getSmartTransactionDescription function.
 * - SmartTransactionDescriptionOutput - The return type for the getSmartTransactionDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTransactionDescriptionInputSchema = z.object({
  transactionType: z.enum(['sale', 'payment']).describe('The type of the transaction (sale or payment).'),
  amount: z.number().describe('The amount of the transaction.'),
  customerName: z.string().describe('The name of the customer.'),
  previousDescription: z.string().optional().describe('The previous description of the transaction, if any.'),
});
export type SmartTransactionDescriptionInput = z.infer<typeof SmartTransactionDescriptionInputSchema>;

const SmartTransactionDescriptionOutputSchema = z.object({
  description: z.string().describe('The AI-suggested description for the transaction.'),
});
export type SmartTransactionDescriptionOutput = z.infer<typeof SmartTransactionDescriptionOutputSchema>;

export async function getSmartTransactionDescription(
  input: SmartTransactionDescriptionInput
): Promise<SmartTransactionDescriptionOutput> {
  return smartTransactionDescriptionFlow(input);
}

const smartTransactionDescriptionPrompt = ai.definePrompt({
  name: 'smartTransactionDescriptionPrompt',
  input: {schema: SmartTransactionDescriptionInputSchema},
  output: {schema: SmartTransactionDescriptionOutputSchema},
  prompt: `You are an AI assistant that suggests transaction descriptions for a mobile app.

  Based on the transaction type, amount, and customer name, suggest a concise and meaningful description.
  If a previous description exists, improve it, otherwise create a new one.

  Transaction Type: {{{transactionType}}}
  Amount: {{{amount}}}
  Customer Name: {{{customerName}}}
  Previous Description: {{{previousDescription}}}

  Description:`,
});

const smartTransactionDescriptionFlow = ai.defineFlow(
  {
    name: 'smartTransactionDescriptionFlow',
    inputSchema: SmartTransactionDescriptionInputSchema,
    outputSchema: SmartTransactionDescriptionOutputSchema,
  },
  async input => {
    const {output} = await smartTransactionDescriptionPrompt(input);
    return output!;
  }
);
