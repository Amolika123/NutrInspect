'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting cheap, healthy, and safer alternative foods.
 *
 * The flow takes an identified food as input and returns suggestions for alternative foods,
 * including cooked options with recipes and packaged options with prices.
 * It exports the SuggestHealthyAlternativesInput and SuggestHealthyAlternativesOutput types, as well as
 * the suggestHealthyAlternatives function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHealthyAlternativesInputSchema = z.object({
  identifiedFood: z
    .string()
    .describe('The name of the identified food for which to suggest alternatives.'),
});
export type SuggestHealthyAlternativesInput = z.infer<typeof SuggestHealthyAlternativesInputSchema>;

const CookedAlternativeSchema = z.object({
  name: z.string().describe('The name of the cooked alternative food.'),
  recipe: z.string().describe('The recipe for how to prepare the cooked alternative.'),
  imageUrl: z.string().url().describe('A placeholder image URL for the food from picsum.photos.'),
});

const PackagedAlternativeSchema = z.object({
  name: z.string().describe('The name of the packaged alternative food.'),
  price: z.string().describe('The estimated price of the packaged alternative in rupees (₹).'),
  imageUrl: z.string().url().describe('A placeholder image URL for the food from picsum.photos.'),
});

const SuggestHealthyAlternativesOutputSchema = z.object({
  cookedAlternatives: z
    .array(CookedAlternativeSchema)
    .describe('An array of suggestions for healthy cooked alternative foods with recipes.'),
  packagedAlternatives: z
    .array(PackagedAlternativeSchema)
    .describe('An array of suggestions for healthy packaged alternative foods with prices in rupees.'),
});
export type SuggestHealthyAlternativesOutput = z.infer<typeof SuggestHealthyAlternativesOutputSchema>;

/**
 * Suggests cheap, healthy, and safer alternative foods based on the identified food.
 * @param input The input containing the identified food.
 * @returns The output containing an array of alternative food suggestions.
 */
export async function suggestHealthyAlternatives(
  input: SuggestHealthyAlternativesInput
): Promise<SuggestHealthyAlternativesOutput> {
  return suggestHealthyAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHealthyAlternativesPrompt',
  input: {schema: SuggestHealthyAlternativesInputSchema},
  output: {schema: SuggestHealthyAlternativesOutputSchema},
  prompt: `For the given food, "{{identifiedFood}}", suggest 2 healthy cooked alternatives and 2 healthy packaged alternatives.

For each alternative, provide a placeholder image URL from https://picsum.photos. The URL should be in the format 'https://picsum.photos/seed/{a-unique-seed}/400/300'.

For the cooked alternatives, provide a simple recipe for each.
For the packaged alternatives, provide an estimated price in Indian Rupees (₹).

Ensure you return a JSON object with 'cookedAlternatives' and 'packagedAlternatives' arrays.
`,
});

const suggestHealthyAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestHealthyAlternativesFlow',
    inputSchema: SuggestHealthyAlternativesInputSchema,
    outputSchema: SuggestHealthyAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
