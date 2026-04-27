// src/services/imageService.ts

const imageCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

const BLOCKED_FRAGMENTS = ['logo', 'icon', 'banner', 'Flag_of', '.svg', 'apple-touch', 'placeholder', 'no-image', 'questionmark'];

function isValidImageUrl(url: unknown, width?: number, height?: number, strictLandscape: boolean = false): url is string {
  if (typeof url !== 'string' || !url.startsWith('https://')) return false;
  const lower = url.toLowerCase();
  if (BLOCKED_FRAGMENTS.some(frag => lower.includes(frag))) return false;
  
  if (typeof width === 'number' && width < 200) return false;
  
  // Filtering system for vertical/portrait photos (Posters)
  if (typeof width === 'number' && typeof height === 'number') {
    // If strict landscape is requested (e.g. for Movies), height MUST be less than width
    if (strictLandscape && height >= width) return false;
    
    // General fallback: don't allow extreme vertical stretching even in normal mode
    if (height > width * 1.5) return false;
  }
  return true;
}

// Wikipedia REST API — works fine from browser (has CORS headers)
async function fetchFromWikipedia(term: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.thumbnail?.source;
    const w = data.thumbnail?.width;
    const h = data.thumbnail?.height;
    return isValidImageUrl(url, w, h) ? url : null;
  } catch { return null; }
}

export async function resolveImage(searchTerm: string, strictLandscape: boolean = false, retryOffset: number = 0): Promise<string | null> {
  const cacheKey = `${searchTerm}${strictLandscape ? '_landscape' : ''}${retryOffset > 0 ? `_off${retryOffset}` : ''}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey)!;
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey)!;

  const isDev = import.meta.env.DEV;

  const resolveInternal = async (): Promise<string | null> => {
    if (!isDev) {
      try {
        const res = await fetch(`/api/fetch-image?term=${encodeURIComponent(searchTerm)}&landscape=${strictLandscape}&offset=${retryOffset}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.url ?? null;
      } catch { return null; }
    }

    try {
      // In dev, we fetch up to 10 results and skip based on the retryOffset
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=10&prop=pageimages|imageinfo&pithumbsize=1000&iiprop=url&iiurlwidth=1000&format=json&origin=*`
      );
      const data = await searchRes.json();
      const pages = Object.values(data?.query?.pages ?? {}) as any[];
      
      // Filter for valid images first
      const validImages = pages
        .map(page => ({
          url: page.thumbnail?.source || page.imageinfo?.[0]?.thumburl,
          w: page.thumbnail?.width || page.imageinfo?.[0]?.width,
          h: page.thumbnail?.height || page.imageinfo?.[0]?.height
        }))
        .filter(img => isValidImageUrl(img.url, img.w, img.h, strictLandscape));

      // Return the image at the requested offset (cycling if out of bounds)
      if (validImages.length > 0) {
        return validImages[retryOffset % validImages.length].url;
      }
    } catch {}
    
    return fetchFromWikipedia(searchTerm);
  };

  const promise = resolveInternal().then(url => {
    if (url) imageCache.set(cacheKey, url);
    inFlight.delete(cacheKey);
    return url;
  }).catch(() => {
    inFlight.delete(cacheKey);
    return null;
  });

  inFlight.set(cacheKey, promise);
  return promise;
}

export function prefetchBoardImages(board: any): void {
  for (const category of board ?? []) {
    for (const question of category.questions ?? []) {
      if (question.searchTerm) resolveImage(question.searchTerm);
    }
  }
}
export function clearImageCache(searchTerm: string, strictLandscape: boolean = false): void {
  const cacheKey = `${searchTerm}${strictLandscape ? '_landscape' : ''}`;
  imageCache.delete(cacheKey);
  inFlight.delete(cacheKey);
}
