"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FullAnalysisResult } from '@/lib/types';
import { HealthScoreChart } from './health-score-chart';
import { Lightbulb, Leaf, Zap, BarChart, ChefHat } from 'lucide-react';
import { Badge } from './ui/badge';

interface AnalysisResultsProps {
  result: FullAnalysisResult;
  imageUrl: string;
}

const nutrientIcons = {
  calories: <Zap className="h-6 w-6 text-yellow-500" />,
  protein: <Leaf className="h-6 w-6 text-green-500" />,
  carbohydrates: <BarChart className="h-6 w-6 text-blue-500" />,
  sugar: <Zap className="h-6 w-6 text-purple-500" />,
  fat: <ChefHat className="h-6 w-6 text-orange-500" />,
};

export function AnalysisResults({ result, imageUrl }: AnalysisResultsProps) {
  const { analysis, parsedNutrition, rating, alternatives } = result;

  const nutrients = [
    { name: 'Calories', value: parsedNutrition.calories, unit: 'kcal', icon: nutrientIcons.calories },
    { name: 'Protein', value: parsedNutrition.protein, unit: 'g', icon: nutrientIcons.protein },
    { name: 'Carbs', value: parsedNutrition.carbohydrates, unit: 'g', icon: nutrientIcons.carbohydrates },
    { name: 'Sugar', value: parsedNutrition.sugar, unit: 'g', icon: nutrientIcons.sugar },
    { name: 'Fat', value: parsedNutrition.fat, unit: 'g', icon: nutrientIcons.fat },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-4">
          <Card className="overflow-hidden shadow-lg">
            <div className="aspect-square relative w-full">
              <Image
                src={imageUrl}
                alt={analysis.dishIdentification}
                fill
                className="object-cover"
              />
            </div>
          </Card>
           <h1 className="font-headline text-4xl font-bold tracking-tight text-center md:text-left">
            {analysis.dishIdentification}
          </h1>
        </div>
        
        <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">Health Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center">
              <HealthScoreChart score={rating.healthScore} />
              <p className="text-muted-foreground mt-4 max-w-xs">{rating.explanation}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Nutrition at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {nutrients.map((nutrient) => (
                  <Card key={nutrient.name} className="bg-background/50 text-center p-4">
                    <div className="flex justify-center mb-2">{nutrient.icon}</div>
                    <p className="text-sm text-muted-foreground">{nutrient.name}</p>
                    <p className="text-2xl font-bold">{nutrient.value}</p>
                    <p className="text-xs text-muted-foreground">{nutrient.unit}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="text-accent" />
            Healthy Alternatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {alternatives.alternatives.map((alt, index) => (
              <Badge key={index} variant="secondary" className="text-lg px-4 py-2 rounded-full border-primary/20 border">
                {alt.replace(/^\d+\.\s*/, '')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
