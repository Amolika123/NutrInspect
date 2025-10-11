import Link from "next/link";
import { Logo } from "@/components/icons";

export function AppHeader() {
  return (
    <header className="py-4 px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-semibold text-foreground">
            NutrInspect
          </span>
        </Link>
      </div>
    </header>
  );
}
