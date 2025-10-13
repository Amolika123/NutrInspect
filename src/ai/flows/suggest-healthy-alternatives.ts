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
  imageUrl: z.string().describe('URL of an image of the food.'),
});

const PackagedAlternativeSchema = PackagedAlternativeOutputSchema.extend({
  imageUrl: z.string().describe('URL of an image of the food.'),
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

    // Function to generate an image and return its URL (as a data URI)
    const generateImageUrl = async (promptText: string) => {
      try {
        const {media} = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `A clear, high-quality, appetizing photo of ${promptText} on a clean background.`,
          config: {
            safetySettings: [
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ],
          },
        });
        return media.url;
      } catch (e) {
        console.error(`Failed to generate image for "${promptText}":`, e);
        // Fallback to a placeholder if generation fails
        const seed = promptText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `https://picsum.photos/seed/${seed}/400/400`;
      }
    };
    
    // Generate images for all alternatives in parallel
    const cookedWithImages = await Promise.all(
      output.cookedAlternatives.map(async alt => ({
        ...alt,
        imageUrl: await generateImageUrl(alt.name),
      }))
    );

    const packagedWithImages = await Promise.all(
      output.packagedAlternatives.map(async alt => ({
        ...alt,
        imageUrl: await generateImageUrl(alt.name),
      }))
    );
    
    return {
      cookedAlternatives: cookedWithImages,
      packagedAlternatives: packagedWithImages,
    };
  }
);
