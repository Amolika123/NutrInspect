import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-food-image.ts';
import '@/ai/flows/provide-health-rating.ts';
import '@/ai/flows/suggest-healthy-alternatives.ts';