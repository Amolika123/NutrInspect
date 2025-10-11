'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting cheap, healthy, and safer alternative foods.
 *
 * The flow takes an identified food as input and returns suggestions for alternative foods.
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

const SuggestHealthyAlternativesOutputSchema = z.object({
  alternatives: z
    .array(z.string())
    .describe('An array of suggestions for cheap, healthy, and safer alternative foods.'),
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
  prompt: `Suggest 3 cheap, healthy, and safer alternative foods for {{identifiedFood}}.\n\nOutput the alternatives as a numbered list.
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
