const MEMORY_KEY = 'jeparty_topic_memory_v1';
const MAX_GAMES = 5;
const EXPIRY_MS = 86400000; // 24h

interface CategoryMemory {
  topics: string[];       // topics covered, oldest first
  updatedAt: number;
}

interface TopicMemory {
  [categoryKey: string]: CategoryMemory;
}

function normalizeCategory(name: string): string {
  // Strip suffixes, lowercase, trim — "Anime Hard -v" → "anime hard"
  return name.replace(/\s*-[va]\s*$/i, '').trim().toLowerCase();
}

function load(): TopicMemory {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(MEMORY_KEY) : null;
    if (!raw) return {};
    return JSON.parse(raw) as TopicMemory;
  } catch {
    return {};
  }
}

function save(memory: TopicMemory): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    }
  } catch {}
}

// Called after board generation — extract topics from generated board and store them
export function recordBoardTopics(board: any[]): void {
  const memory = load();
  const now = Date.now();

  for (const cat of board) {
    const key = normalizeCategory(cat.category);
    // Extract topic = answer field (1-4 words, specific subject)
    const newTopics: string[] = cat.questions
      .map((q: any) => (q.answer as string)?.trim())
      .filter(Boolean);

    const existing = memory[key]?.topics ?? [];

    // Deduplicate — remove any new topic already in existing, then append
    const deduped = newTopics.filter(
      t => !existing.map(e => e.toLowerCase()).includes(t.toLowerCase())
    );

    const merged = [...existing, ...deduped];
    const maxTopics = MAX_GAMES * 7;
    memory[key] = {
      topics: merged.slice(-maxTopics),
      updatedAt: now,
    };
  }

  save(memory);
}

// Called before generation — returns topics to exclude per category
export function getExclusionTopics(categories: string[]): Record<string, string[]> {
  const memory = load();
  const now = Date.now();
  const result: Record<string, string[]> = {};

  for (const cat of categories) {
    const key = normalizeCategory(cat);
    const entry = memory[key];
    if (!entry) continue;
    // Expired — ignore
    if (now - entry.updatedAt > EXPIRY_MS) continue;
    if (entry.topics.length > 0) {
      result[key] = entry.topics;
    }
  }

  console.debug('[TopicMemory] exclusions built:', JSON.stringify(result));
  return result;
}

// Clear all memory — call on TERMINATE / NEW GAME if desired (optional)
export function clearTopicMemory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MEMORY_KEY);
  }
}
