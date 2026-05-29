const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_BASE_URL = "https://pixabay.com/api";

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
}

interface PixabayResponse {
  hits: PixabayImage[];
  totalHits: number;
}

export async function searchImages(
  keyword: string,
  count: number = 5
): Promise<PixabayImage[]> {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY || "",
    q: keyword,
    image_type: "photo",
    orientation: "horizontal",
    per_page: count.toString(),
    safesearch: "true",
  });

  const response = await fetch(`${PIXABAY_BASE_URL}/?${params}`);

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.statusText}`);
  }

  const data: PixabayResponse = await response.json();
  return data.hits;
}

export async function getRandomImage(
  keyword: string
): Promise<PixabayImage | null> {
  const images = await searchImages(keyword, 10);
  if (images.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

export async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return response.arrayBuffer();
}
