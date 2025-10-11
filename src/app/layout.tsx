import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from '@/components/app-header';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'NutrInspect',
  description: 'Analyze food images for nutritional insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")}>
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
