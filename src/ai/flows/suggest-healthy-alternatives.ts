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

const CookedAlternativeOutputSchema = z.object({
  name: z.string().describe('The name of the cooked alternative food.'),
  recipe: z.string().describe('The recipe for how to prepare the cooked alternative.'),
});

const PackagedAlternativeOutputSchema = z.object({
  name: z.string().describe('The name of the packaged alternative food.'),
  price: z.string().describe('The estimated price of the packaged alternative in rupees (₹).'),
});

const SuggestHealthyAlternativesOutputSchema = z.object({
  cookedAlternatives: z
    .array(CookedAlternativeOutputSchema)
    .describe('An array of suggestions for healthy cooked alternative foods with recipes.'),
  packagedAlternatives: z
    .array(PackagedAlternativeOutputSchema)
    .describe('An array of suggestions for healthy packaged alternative foods with prices in rupees.'),
});

const CookedAlternativeSchema = CookedAlternativeOutputSchema.extend({
  imageUrl: z.string(),
});

const PackagedAlternativeSchema = PackagedAlternativeOutputSchema.extend({
  imageUrl: z.string(),
});

export type SuggestHealthyAlternativesOutput = {
  cookedAlternatives: z.infer<typeof CookedAlternativeSchema>[];
  packagedAlternatives: z.infer<typeof PackagedAlternativeSchema>[];
};


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

For the cooked alternatives, provide a simple recipe for each.
For the packaged alternatives, provide an estimated price in Indian Rupees (₹).

Ensure you return a JSON object with 'cookedAlternatives' and 'packagedAlternatives' arrays.
`,
});

const suggestHealthyAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestHealthyAlternativesFlow',
    inputSchema: SuggestHealthyAlternativesInputSchema,
    outputSchema: z.object({
      cookedAlternatives: z.array(CookedAlternativeSchema),
      packagedAlternatives: z.array(PackagedAlternativeSchema),
    }),
  },
  async (input): Promise<SuggestHealthyAlternativesOutput> => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('Could not generate alternatives.');
    }

    const getPlaceholderImage = (name: string) => {
      // Simple hashing function to get a somewhat unique seed from the name
      const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `https://picsum.photos/seed/${seed}/400/400`;
    };

    const cookedWithImages = output.cookedAlternatives.map(alt => ({
        ...alt,
        imageUrl: getPlaceholderImage(alt.name),
      }));

    const packagedWithImages = output.packagedAlternatives.map(alt => ({
        ...alt,
        imageUrl: getPlaceholderImage(alt.name),
      }));

    return {
      cookedAlternatives: cookedWithImages,
      packagedAlternatives: packagedWithImages,
    };
  }
);
