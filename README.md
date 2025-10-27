# NutrInspect: AI-Powered Nutrition Analysis 🥗

Welcome to NutrInspect! This application leverages AI to provide instant nutritional insights from a photo of your meal. Snap a picture, and let the app tell you the story behind your food.

## ✨ Features

- **📷 Image-Based Analysis**: Simply upload or drag-and-drop a photo of your food.
- **🔬 AI-Powered Insights**: Get an AI-generated identification of the dish and an estimated breakdown of its nutritional content (calories, protein, carbs, fat, and sugar).
- **🔟 Health Score**: See a simple health score from 1 to 10, helping you quickly assess how healthy the meal is.
- **🥗 Smart Alternatives**: If a meal's health score is below 8, the app suggests healthier cooked and packaged alternatives, complete with recipes and images.
- **Consistency Checks**: The AI is designed to detect and correct inconsistencies in nutritional data (e.g., if a label says 0 calories but has high fat content).

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Image Service**: [Unsplash API](https://unsplash.com/developers) for fetching high-quality food images.
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/hosting).

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Google Cloud project with billing enabled to use the AI models.
- An Unsplash API Access Key for fetching food images.

### Installation & Setup

1.  **Clone the repository**

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your API keys:
    ```
    GEMINI_API_KEY=your_google_ai_api_key
    UNSPLASH_ACCESS_KEY=your_unsplash_access_key
    ```

4.  **Run the development server:**
    The application consists of the Next.js frontend and the Genkit AI flows, which need to be run concurrently.

    In one terminal, run the Next.js app:
    ```bash
    npm run dev
    ```
    This will start the frontend on `http://localhost:9002`.

    In a second terminal, run the Genkit flows:
    ```bash
    npm run genkit:watch
    ```
    This starts the Genkit development server, allowing the frontend to communicate with your AI flows.

### How It Works

1.  The user uploads an image on the frontend (`src/app/page.tsx`).
2.  A call is made to the `performAnalysis` server action in `src/app/actions.ts`.
3.  This action orchestrates calls to several Genkit flows defined in `src/ai/flows/`:
    - `analyzeFoodImage`: Identifies the dish and estimates its nutrition.
    - `provideHealthRating`: Calculates a health score based on the nutritional data.
    - `suggestHealthyAlternatives`: If the score is low, it finds healthier options and fetches their images using the Unsplash API (`src/lib/unsplash.ts`).
4.  The final, aggregated result is returned to the frontend and displayed to the user in the `AnalysisResults` component.
