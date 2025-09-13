"use server";

import {
  getSmartTransactionDescription,
  type SmartTransactionDescriptionInput,
} from "@/ai/flows/smart-transaction-descriptions";

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
      error: "Failed to generate description.",
    };
  }
}
