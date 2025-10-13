'use server';

import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { provideHealthRating } from '@/ai/flows/provide-health-rating';
import { suggestHealthyAlternatives } from '@/ai/flows/suggest-healthy-alternatives';
import type { FullAnalysisResult, ParsedNutrition } from '@/lib/types';

function parseNutrition(content: string): ParsedNutrition {
  // More robust parsing function to handle "Key: Value" formats and conversational text.
  const extractValue = (key: string, text: string): number => {
    // Regex to find "Key: number" or "Key number" or "number g Key"
    const regex = new RegExp(
      `(?:${key}\\s*:?\\s*(\\d*\\.?\\d+))|(?:(\\d*\\.?\\d+)\\s*g(?:\\s+of)?\\s+${key})`,
      'i'
    );
    const match = text.match(regex);
    if (match) {
      // Return the first captured group that is a number
      return parseFloat(match[1] || match[2]);
    }
    return 0;
  };

  const calories = extractValue('calories', content) || extractValue('kcal', content);
  const protein = extractValue('protein', content);
  const carbohydrates = extractValue('carbohydrates', content);
  const sugar = extractValue('sugar', content);
  const fat = extractValue('fat', content);

  const nutrition: ParsedNutrition = {
    calories,
    protein,
    carbohydrates,
    sugar,
    fat,
  };

  // Only throw an error if we couldn't parse ANYTHING.
  if (Object.values(nutrition).every(val => val === 0)) {
    throw new Error("Could not parse nutritional information from the analysis. The format might be unexpected. The response was: " + content);
  }

  return nutrition;
}


export async function performAnalysis(
  photoDataUri: string
): Promise<FullAnalysisResult | null> {
  if (!photoDataUri) {
    throw new Error('Image data URI is required.');
  }

  const analysis = await analyzeFoodImage({ photoDataUri });
  if (!analysis?.dishIdentification || !analysis.estimatedNutritionalContent) {
    throw new Error('Failed to analyze the food image.');
  }

  const parsedNutrition = parseNutrition(analysis.estimatedNutritionalContent);

  const rating = await provideHealthRating({
    foodName: analysis.dishIdentification,
    ...parsedNutrition,
  });

  const alternatives = await suggestHealthyAlternatives({
    identifiedFood: analysis.dishIdentification,
  });

  if (!rating || !alternatives) {
    throw new Error('Failed to get health rating or alternatives.');
  }

  return { analysis, parsedNutrition, rating, alternatives };
}
