import type { AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import type { ProvideHealthRatingOutput } from '@/ai/flows/provide-health-rating';
import type { SuggestHealthyAlternativesOutput } from '@/ai/flows/suggest-healthy-alternatives';

export type ParsedNutrition = {
  calories: number;
  protein: number;
  carbohydrates: number;
  sugar: number;
  fat: number;
};

export type FullAnalysisResult = {
  analysis: AnalyzeFoodImageOutput;
  rating: ProvideHealthRatingOutput;
  alternatives: SuggestHealthyAlternativesOutput;
  parsedNutrition: ParsedNutrition;
};
