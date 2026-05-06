import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOCKED_FRAGMENTS = ['logo', 'icon', 'banner', 'Flag_of', '.svg', 'apple-touch', 'placeholder', 'no-image', 'questionmark'];
const USER_AGENT = 'Jeparty/1.0 (https://github.com/xenkzu/jeparty; yashkaul777@gmail.com)';

function isValidImageUrl(
  url: unknown,
  width?: number,
  height?: number,
  strictLandscape: boolean = false
): url is string {
  if (typeof url !== 'string' || !url.startsWith('https://')) return false;
  const lower = url.toLowerCase();
  if (BLOCKED_FRAGMENTS.some(frag => lower.includes(frag))) return false;
  
  if (typeof width === 'number' && width < 200) return false;
  
  if (typeof width === 'number' && typeof height === 'number') {
    if (strictLandscape && height >= width) return false;
    if (height > width * 1.8) return false; // Allow a bit more for portrait in generic mode
  }
  return true;
}

// Wikipedia Summary (Best for characters)
async function fetchFromWikipedia(term: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
      { headers: { 'User-Agent': USER_AGENT } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.thumbnail?.source;
    if (isValidImageUrl(url, data.thumbnail?.width, data.thumbnail?.height)) return url;
    return null;
  } catch (e) {
    console.error('Wiki Summary Error:', e);
    return null;
  }
}

// Wikimedia Commons Search (Supports Offsets)
async function fetchFromWikimediaCommons(term: string, offset: number = 0, strictLandscape: boolean = false): Promise<string | null> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(term)}&gsrlimit=10&gsroffset=${offset}&prop=imageinfo&iiprop=url|size&iiurlwidth=1000&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages ?? {}) as any[];
    
    // Find the first valid image in the results
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (isValidImageUrl(info?.thumburl, info?.width, info?.height, strictLandscape)) {
        return info.thumburl;
      }
    }
    return null;
  } catch (e) {
    console.error('Commons Search Error:', e);
    return null;
  }
}

// DuckDuckGo Image Search (Fallback)
async function fetchFromDuckDuckGo(term: string, offset: number = 0): Promise<string | null> {
  try {
    const initRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(term)}&iax=images&ia=images`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!initRes.ok) return null;
    const html = await initRes.text();
    const vqdMatch = html.match(/vqd=([\d-]+)/);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];

    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?q=${encodeURIComponent(term)}&vqd=${vqd}&f=,,,,,&p=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://duckduckgo.com/' } }
    );
    if (!imgRes.ok) return null;
    const data = await imgRes.json();
    const results = data?.results ?? [];
    if (results.length > 0) {
      // Use offset to pick a different image
      const idx = offset % results.length;
      return results[idx]?.image ?? null;
    }
    return null;
  } catch (e) {
    console.error('DDG Error:', e);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const term = (req.query.term || req.body?.searchTerm) as string;
  const offsetStr = (req.query.offset || '0') as string;
  const landscape = req.query.landscape === 'true';
  const offset = parseInt(offsetStr, 10) || 0;
  
  if (!term) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  console.log(`Fetching image for: "${term}" (offset: ${offset}, landscape: ${landscape})`);

  // Try sources in sequence for better control over quality vs reliability
  // 1. Wikipedia Summary (best for primary subject)
  let imageUrl = await fetchFromWikipedia(term);
  
  // 2. If no summary or offset requested, try Commons
  if (!imageUrl || offset > 0) {
    imageUrl = await fetchFromWikimediaCommons(term, offset, landscape);
  }

  // 3. Fallback to DDG
  if (!imageUrl) {
    imageUrl = await fetchFromDuckDuckGo(term, offset);
  }

  if (!imageUrl) {
    console.warn(`No image found for term: ${term}`);
    return res.status(404).json({ error: 'No image found from any source' });
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  return res.status(200).json({ url: imageUrl });
}
