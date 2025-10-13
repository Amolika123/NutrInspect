'use server';

import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { provideHealthRating } from '@/ai/flows/provide-health-rating';
import { suggestHealthyAlternatives } from '@/ai/flows/suggest-healthy-alternatives';
import type { FullAnalysisResult, ParsedNutrition } from '@/lib/types';

function parseNutrition(content: string): ParsedNutrition {
  // Function to extract a value, handling ranges by averaging them.
  const extractValue = (regex: RegExp, text: string): number => {
    const match = text.match(regex);
    if (match) {
      if (match[1] && match[2]) {
        // It's a range (e.g., "150-160"), so average it.
        return (parseFloat(match[1]) + parseFloat(match[2])) / 2;
      } else if (match[1]) {
        // It's a single number.
        return parseFloat(match[1]);
      }
    }
    return 0;
  };

  const calories = extractValue(/(\d[\d.]*)-?(\d[\d.]*)?\s*calories/i, content);
  const protein = extractValue(/(\d[\d.]*)-?(\d[\d.]*)?\s*g\s*protein/i, content);
  const carbohydrates = extractValue(/(\d[\d.]*)-?(\d[\d.]*)?\s*g\s*carbohydrates/i, content);
  const sugar = extractValue(/(\d[\d.]*)-?(\d[\d.]*)?\s*g\s*sugar/i, content);
  const fat = extractValue(/(\d[\d.]*)-?(\d[\d.]*)?\s*g\s*fat/i, content);

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
