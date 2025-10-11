"use client";

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { performAnalysis } from '@/app/actions';
import type { FullAnalysisResult } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ImageUploader from '@/components/image-uploader';
import { AnalysisLoading } from '@/components/analysis-loading';
import { AnalysisResults } from '@/components/analysis-results';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setResult(null);
      setError(null);
      
      startTransition(async () => {
        try {
          const analysisResult = await performAnalysis(dataUrl);
          if (analysisResult) {
            setResult(analysisResult);
          } else {
            throw new Error("Analysis failed to return results.");
          }
        } catch (e: any) {
          const errorMessage = e.message || "An unknown error occurred.";
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: errorMessage,
          });
        }
      });
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected file.",
      });
    };
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPreviewUrl(null);
  };

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {!previewUrl && (
        <div className="relative rounded-xl overflow-hidden min-h-[50vh] flex items-center justify-center text-center p-8 bg-card shadow-lg">
           {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-20"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
              Snap, Analyze, Nourish
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground">
              Discover the nutritional story behind your meals. Just upload a photo and let our AI provide a detailed analysis and healthier alternatives.
            </p>
            <div className="w-full max-w-md">
              <ImageUploader onImageUpload={handleImageUpload} isPending={isPending} />
            </div>
          </div>
        </div>
      )}

      {isPending && <AnalysisLoading />}

      {result && previewUrl && (
        <div className="animate-in fade-in-50 duration-500">
          <AnalysisResults result={result} imageUrl={previewUrl} />
          <div className="text-center mt-8">
            <Button onClick={handleReset} variant="outline" size="lg">Analyze Another Meal</Button>
          </div>
        </div>
      )}
      
      {error && !isPending && (
         <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-destructive mb-4">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleReset} variant="destructive">Try Again</Button>
         </div>
      )}
    </div>
  );
}
