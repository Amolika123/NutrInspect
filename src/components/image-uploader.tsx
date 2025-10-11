"use client";

import { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isPending: boolean;
}

export default function ImageUploader({ onImageUpload, isPending }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "Image too large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isPending}
      />
      <label 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background/50",
          isPending && "cursor-not-allowed opacity-50"
        )}
      >
        <Button
          onClick={handleButtonClick}
          disabled={isPending}
          variant="default"
          size="lg"
          className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
          )}
          {isPending ? 'Analyzing...' : 'Upload or Drag Image'}
        </Button>
        <p className="text-sm text-muted-foreground mt-3">Or drag and drop a food photo here.</p>
      </label>
    </div>
  );
}
