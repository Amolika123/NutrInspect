'use server';

import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { provideHealthRating } from '@/ai/flows/provide-health-rating';
import { suggestHealthyAlternatives } from '@/ai/flows/suggest-healthy-alternatives';
import type { FullAnalysisResult, ParsedNutrition } from '@/lib/types';

function parseNutrition(content: string): ParsedNutrition {
  const parseNutrient = (nutrient: string): number => {
    const regex = new RegExp(`${nutrient}:\\s*(\\d+\\.?\\d*)\\s*g?`, 'i');
    const match = content.match(regex);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const parseCalories = (): number => {
    const regex = new RegExp(`calories:\\s*(\\d+\\.?\\d*)`, 'i');
    const match = content.match(regex);
    return match ? parseFloat(match[1]) : 0;
  };

  const nutrition: ParsedNutrition = {
    calories: parseCalories(),
    protein: parseNutrient('protein'),
    carbohydrates: parseNutrient('carbohydrates'),
    sugar: parseNutrient('sugar'),
    fat: parseNutrient('fat'),
  };

  if (Object.values(nutrition).every(val => val === 0)) {
    throw new Error("Could not parse nutritional information from the analysis. The format might be unexpected.");
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
