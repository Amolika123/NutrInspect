'use server';

/**
 * Fetches a food image URL from Unsplash.
 * @param foodName The name of the food to search for.
 * @returns The URL of the image or a placeholder if not found or if the key is missing.
 */
export async function getFoodImage(foodName: string): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const seed = foodName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackUrl = `https://picsum.photos/seed/${seed}/400/400`;

  if (!accessKey) {
    console.warn("Unsplash Access Key is not configured. Falling back to placeholder images.");
    return fallbackUrl;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(foodName)}&per_page=1&orientation=squarish&client_id=${accessKey}`
    );

    if (!response.ok) {
        console.error(`Unsplash API error: ${response.statusText}`);
        return fallbackUrl;
    }

    const data = await response.json();
    const imageUrl = data.results?.[0]?.urls?.regular;

    return imageUrl || fallbackUrl;
  } catch (error) {
    console.error("Failed to fetch image from Unsplash:", error);
    return fallbackUrl;
  }
}
