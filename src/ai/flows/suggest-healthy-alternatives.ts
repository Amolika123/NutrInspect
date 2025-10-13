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
  imageUrl: z
    .string()
    .describe(
      "A generated image of the food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const PackagedAlternativeSchema = z.object({
  name: z.string().describe('The name of the packaged alternative food.'),
  price: z.string().describe('The estimated price of the packaged alternative in rupees (₹).'),
  imageUrl: z
    .string()
    .describe(
      "A generated image of the food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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

For each alternative, generate a relevant image of the food.

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

    if (!output) {
      throw new Error('Could not generate alternatives.');
    }

    const generateImage = async (name: string) => {
      const {media} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A clear, appetizing photo of ${name}, presented on a clean, simple background.`,
      });
      return media.url;
    };

    const cookedWithImages = await Promise.all(
      output.cookedAlternatives.map(async alt => ({
        ...alt,
        imageUrl: await generateImage(alt.name),
      }))
    );

    const packagedWithImages = await Promise.all(
      output.packagedAlternatives.map(async alt => ({
        ...alt,
        imageUrl: await generateImage(alt.name),
      }))
    );

    return {
      cookedAlternatives: cookedWithImages,
      packagedAlternatives: packagedWithImages,
    };
  }
);
