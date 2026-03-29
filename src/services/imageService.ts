/**
 * Multi-source image fetching service for visual questions.
 * Routes to Pokemon (PokeAPI), Anime (Jikan), or General (Wikipedia) APIs.
 */
export const fetchVisualImage = async (searchTerm: string, imageSource: string): Promise<string | null> => {
  try {
    if (imageSource === 'pokemon') {
      // Lowercase and hyphenate, stripping suffixes like " pokemon", " type", etc.
      const term = searchTerm.toLowerCase()
        .replace(/ (pokemon|type|move|item|ball)$/i, '')
        .trim()
        .replace(/\s+/g, '-');
        
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${term}`);
      if (!res.ok) return null;
      const data = await res.json();
      return (
        data.sprites.other?.['official-artwork']?.front_default || 
        data.sprites.front_default || 
        null
      );
    }

    if (imageSource === 'anime') {
      const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchTerm)}&limit=1`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (!data.data || data.data.length === 0) return null;
      
      const imageUrl = data.data[0].images?.jpg?.image_url;
      if (!imageUrl) return null;
      
      // Strict placeholder validation
      if (imageUrl.includes('apple-touch-icon') || imageUrl.includes('questionmark')) {
        return null;
      }
      
      return imageUrl;
    }

    // Default: Wikipedia
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || null;

  } catch (error) {
    console.error(`[ImageService] Fetch failed for ${searchTerm} (${imageSource}):`, error);
    return null;
  }
};
