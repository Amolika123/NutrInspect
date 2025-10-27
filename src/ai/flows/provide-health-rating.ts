
'use server';

/**
 * @fileOverview A flow to provide a health rating for a given food based on its nutritional content.
 *
 * - provideHealthRating - A function that takes food name as input and returns a health rating (1-10) and explanation.
 * - ProvideHealthRatingInput - The input type for the provideHealthrating function.
 * - ProvideHealthRatingOutput - The return type for the provideHealthRating function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideHealthRatingInputSchema = z.object({
  foodName: z.string().describe('The name of the food to rate.'),
  calories: z.number().describe('The number of calories in the food.'),
  protein: z.number().describe('The amount of protein in grams.'),
  carbohydrates: z.number().describe('The amount of carbohydrates in grams.'),
  sugar: z.number().describe('The amount of sugar in grams.'),
  fat: z.number().describe('The amount of fat in grams.'),
});

export type ProvideHealthRatingInput = z.infer<typeof ProvideHealthRatingInputSchema>;

const ProvideHealthRatingOutputSchema = z.object({
  healthScore: z.number().describe('A health score between 1 and 10, where 1 is very unhealthy and 10 is very healthy.'),
  explanation: z.string().describe('An explanation of why the food received the given health score.'),
  recalculatedCalories: z.number().optional().describe('The recalculated calorie count if the provided value was deemed incorrect. This is calculated from macronutrients (protein*4, carbs*4, fat*9).'),
});

export type ProvideHealthRatingOutput = z.infer<typeof ProvideHealthRatingOutputSchema>;

export async function provideHealthRating(input: ProvideHealthRatingInput): Promise<ProvideHealthRatingOutput> {
  return provideHealthRatingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideHealthRatingPrompt',
  input: {schema: ProvideHealthRatingInputSchema},
  output: {schema: ProvideHealthRatingOutputSchema},
  prompt: `You are a nutritionist providing a health rating for food.

  Based on the following nutritional information, provide a health score between 1 and 10 (inclusive), where 1 is very unhealthy and 10 is very healthy. Also, provide a brief explanation for your rating.

  IMPORTANT: If the provided calorie count is 0 or seems incorrect given the macronutrient values (protein, carbs, fat), please point out the contradiction in your explanation. Then, calculate the health score based on the macronutrients. Use standard estimations: 4 kcal/g for protein and carbs, 9 kcal/g for fat. If you perform this recalculation, you MUST set the 'recalculatedCalories' field in your output to the new value you calculated. Otherwise, leave it empty.

  Food: {{{foodName}}}
  Calories: {{{calories}}} kcal
  Protein: {{{protein}}} g
  Carbohydrates: {{{carbohydrates}}} g
  Sugar: {{{sugar}}} g
  Fat: {{{fat}}} g
`,
});

const provideHealthRatingFlow = ai.defineFlow(
  {
    name: 'provideHealthRatingFlow',
    inputSchema: ProvideHealthRatingInputSchema,
    outputSchema: ProvideHealthRatingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
