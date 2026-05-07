import { Board, GameSettings } from '../types/game';
import { getExclusionTopics, recordBoardTopics } from './topicMemoryService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Point values by questionsPerCategory
const POINT_VALUES: Record<number, number[]> = {
  3: [100, 300, 500],
  5: [100, 200, 300, 400, 500],
  7: [100, 200, 300, 400, 500, 600, 700],
};

const DIFFICULTY_INSTRUCTION: Record<string, string> = {
  easy: 'Generate casual, well-known trivia. Questions should be common knowledge that most people at a party would know. Pop culture, basic facts, famous names.',
  medium: 'Generate moderately difficult trivia. Questions should require genuine knowledge of the topic. More specific facts, less obvious answers, niche but not obscure.',
  hard: 'Generate expert-level trivia. Questions should be very specific and niche. Only true enthusiasts or experts would know these answers. Avoid obvious facts, focus on deep knowledge of the category.',
};

function buildPrompt(categories: string[], settings: GameSettings, exclusions: Record<string, string[]> = {}): string {
  const { difficulty, questionsPerCategory } = settings;
  const pointValues = POINT_VALUES[questionsPerCategory];
  const visualCategories = categories.filter(c => c.toLowerCase().endsWith(' -v'));
  const audioCategories = categories.filter(c => c.toLowerCase().endsWith(' -a'));
  const promptCategories = categories.map(c => c.replace(/\s*-[v|a]\s*$/i, '').trim());

  const visualCategoryKeys = visualCategories.map(c => 
    c.replace(/\s*-v\s*$/i, '').trim().toLowerCase()
  );
  const audioCategoryKeys = audioCategories.map(c => 
    c.replace(/\s*-a\s*$/i, '').trim().toLowerCase()
  );

  // Build soft-exclusion paragraph for the prompt
  const exclusionLines = Object.entries(exclusions)
    .filter(([, topics]) => topics.length > 0)
    .map(([cat, topics]) => {
      // Only send last 25 topics max per category to cap token usage
      const recent = topics.slice(-25);
      const isVisual = visualCategoryKeys.includes(cat);
      const isAudio = audioCategoryKeys.includes(cat);
      
      if (isVisual) {
        return `- "${cat}": these characters are BANNED [${recent.join(', ')}]\n  You MUST pick entirely different characters not on this list. There are hundreds of anime characters — pick ones you haven't used.`;
      }
      if (isAudio) {
        return `- "${cat}": these songs are BANNED [${recent.join(', ')}]\n  You MUST pick entirely different songs not on this list.`;
      }
      return `- "${cat}": BANNED answers [${recent.join(', ')}]. Use completely different facts/people/concepts.`;
    });

  const exclusionBlock = exclusionLines.length > 0
    ? `BANNED ANSWERS — you are FORBIDDEN from using these as answers in ANY question:
${exclusionLines.join('\n')}
This is a HARD constraint. Using any banned answer will make the output invalid.
You MUST generate questions with completely different answers than those listed above.
If a category has 5 banned answers, generate 5 entirely new answers on different subjects.`
    : '';

  return `${exclusionBlock ? `CRITICAL CONSTRAINT — READ BEFORE GENERATING ANYTHING:
${exclusionBlock}
---
` : ''}Generate a complete Jeopardy game board for these 5 categories: ${promptCategories.join(', ')}.
      Return ONLY valid JSON, no markdown, no backticks, no explanation.
      A JSON array of exactly 5 objects: { category: string, questions: [] }
      Each question object: { value: number, question: string, answer: string, status: 'hidden', searchTerm?: string, searchTermAudio?: string }

      DIFFICULTY: ${DIFFICULTY_INSTRUCTION[difficulty]}

      SPECIAL INSTRUCTION:
      For [VISUAL] categories ([${visualCategories.map(c => c.replace(/\s*-v\s*$/i, '').trim()).join(', ')}]), generate questions that match the category theme exactly.
      However, only generate questions about subjects that have a real Wikipedia page with a thumbnail image.

      Rules:
       - ALWAYS respect the category name and generate questions within that theme
       - For anime categories: use real anime characters that have Wikipedia pages
         GOOD: 'Naruto Uzumaki', 'Goku', 'Monkey D. Luffy', 'Light Yagami'
       - For anime categories with banned characters, draw from this expanded pool:
         Levi Ackerman, Itachi Uchiha, Killua Zoldyck, Rem, Mikasa Ackerman, 
         Vegeta, Saitama, Tanjiro Kamado, Zenitsu Agatsuma, Nezuko Kamado,
         Roronoa Zoro, Nami, Nico Robin, Trafalgar Law, Portgas D. Ace,
         Kakashi Hatake, Sasuke Uchiha, Hinata Hyuga, Rock Lee, Gaara,
         Ryuk, Near, Mello, L Lawliet, Misa Amane,
         Roy Mustang, Riza Hawkeye, Scar, Greed, Ling Yao,
         Spike Spiegel, Faye Valentine, Jet Black, Vicious,
         Yusuke Urameshi, Hiei, Kurama, Toguro
         Pick from these when original choices are banned.
       - For sports categories: use real athletes with Wikipedia pages
         GOOD: 'Cristiano Ronaldo', 'LeBron James', 'Virat Kohli'
       - For geography/landmarks: use real places with Wikipedia pages
         GOOD: 'Eiffel Tower', 'Mount Everest', 'Taj Mahal'
       - For science categories: use real scientists or discoveries with Wikipedia pages
         GOOD: 'Albert Einstein', 'Isaac Newton', 'DNA double helix'
       - For ANY category: pick the most famous and recognizable subjects first
         as they are most likely to have Wikipedia thumbnail images
       - NEVER generate questions about obscure subjects unlikely to have Wikipedia images
       - searchTerm must be the exact Wikipedia page title for that subject
       - imageSource stays 'wikipedia' for all visual questions
       - The answer field must match the searchTerm subject exactly.
       - The question text should be "Guess the character" or "Who is this?".

      For [AUDIO] categories ([${audioCategories.map(c => c.replace(/\s*-a\s*$/i, '').trim()).join(', ')}]), generate music trivia questions where players must identify a song.
        - The "question" field must be EXACTLY one of these strings, chosen randomly:
          "Guess the song." or "Name this track." or "What song is this?"
          The question field must contain ZERO information about the song title, artist, album, or any identifying details.
          CORRECT: "Guess the song."
          WRONG: "Guess the song: Bohemian Rhapsody" or "Name this track by Queen" or "What song is this? (hint: it's from the 80s)"
          The answer field contains the song title and artist. The question field contains nothing except the bare prompt string.
        - DO NOT set "searchTerm" (image) for audio questions. Only set "searchTermAudio" to the song title and artist.
        - The "answer" field must be the song title and artist.

      For all other categories, DO NOT include a searchTerm or searchTermAudio field.
      Make questions fun/casual. Each category must have exactly ${questionsPerCategory} questions with point values: ${pointValues.join(', ')}.

      QUESTION QUALITY RULES — follow strictly:
       1. Every question MUST be phrased as a question ending with a '?'
          GOOD: 'What is the capital of France?'
          BAD: 'The capital of France', 'Name the capital of France'

       2. Every answer must be short and specific — 1 to 4 words maximum
          GOOD: 'Paris', 'Albert Einstein', 'The Eiffel Tower'
          BAD: 'It is Paris', 'The answer is Einstein'

       3. Questions must NEVER repeat within the same category
          Each of the ${questionsPerCategory} questions must test a completely different aspect of the category

        4. Questions must NEVER be ambiguous — only one correct answer is possible

       5. For AUDIO questions specifically: the question field must be a bare prompt with NO colons followed by content, NO artist names, NO song titles, NO album names, NO year hints, NO genre hints. Literally just "Guess the song." — nothing else.

      DIFFICULTY SCALING RULES — strictly follow for every category:
       ${pointValues.map((v, i) => {
    const labels = ['Extremely easy — anyone would know this', 'Easy — most people would know', 'Medium — requires some knowledge', 'Hard — requires strong knowledge', 'Expert level — enthusiasts/experts only', 'Very expert — deep niche knowledge', 'Master level — almost nobody knows this'];
    return `${v} points → ${labels[Math.min(i, labels.length - 1)]}`;
  }).join('\n       ')}

       The difficulty jump between each tier must be noticeable.
       ORDERING IS MANDATORY: The JSON array for each category MUST be ordered index 0 = easiest, index ${questionsPerCategory - 1} = hardest.
       DO NOT shuffle. DO NOT put a hard question at index 0. The array order in your JSON output IS the point value order.
       Verify before outputting: question at index 0 must be answerable by anyone, question at index ${questionsPerCategory - 1} must stump most people.`;
}

/**
 * Generates a complete Jeopardy game board.
 * In production (Vercel): calls the /api/generate-board serverless function.
 * In dev (Vite): calls Groq directly to avoid 404 on missing serverless routes.
 */
export const generateBoard = async (categories: string[], settings: GameSettings): Promise<Board> => {
  try {
    let board: Board;
    const qCount = settings.questionsPerCategory;

    const exclusions = getExclusionTopics(categories);

    if (import.meta.env.DEV) {
      // ─── DEV MODE: Call Groq directly, fall back to mock if offline ──
      if (!GROQ_API_KEY) {
        console.warn('[DEV] No API key found — using mock board');
        board = generateMockBoard(categories, settings);
      } else {
        try {
          board = await fetchBoardFromGroq(categories, settings, exclusions);
        } catch (e) {
          console.error('[DEV] Groq API call failed. Check your API key and network. Error:', e);
          board = generateMockBoard(categories, settings);
        }
      }
    } else {
      // ─── PROD MODE: Call Vercel serverless function ───────────────
      const response = await fetch('/api/generate-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, settings, exclusions })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      board = await response.json();
    }

    // Verify board structure with variable question count
    if (!Array.isArray(board) || board.length !== 5) {
      throw new Error('Invalid board structure from AI: Expected 5 categories');
    }

    for (const cat of board) {
      if (!cat.category || !Array.isArray(cat.questions) || cat.questions.length !== qCount) {
        throw new Error(`Invalid board structure from AI: Each category must have ${qCount} questions`);
      }
    }

    // Record topics from this fresh board into memory
    recordBoardTopics(board);

    return board;
  } catch (error) {
    console.error('Board Generation Failure:', error);
    throw error instanceof Error ? error : new Error('Fatal error generating AI board.');
  }
};

/**
 * Direct Groq call for local development (mirrors api/generate-board.ts prompt).
 */
async function fetchBoardFromGroq(categories: string[], settings: GameSettings, exclusions: Record<string, string[]> = {}): Promise<Board> {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not defined in .env');
  }

  const prompt = buildPrompt(categories, settings, exclusions);

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 5000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  let text = data.choices[0]?.message?.content;

  if (!text) throw new Error('No content returned from Groq.');

  text = text.replace(/```json\n?|```/g, '').trim();
  
  // Robust JSON extraction: Find the first '[' and last ']'
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    text = text.substring(firstBracket, lastBracket + 1);
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('Failed to parse AI JSON. Raw text:', text);
    throw parseError;
  }
}

/**
 * Generates a single replacement question for a category.
 */
export async function generateNewAudioQuestion(category: string, difficulty: string): Promise<{ question: string; answer: string; searchTermAudio: string }> {
  if (!GROQ_API_KEY) {
    return {
      question: "Guess the song.",
      answer: "Mock Song REPLACEMENT",
      searchTermAudio: "Shape of You Ed Sheeran"
    };
  }

  const prompt = `Generate ONE single music trivia question for the category: "${category}".
      Return ONLY valid JSON, no markdown.
      { "question": string, "answer": string, "searchTermAudio": string }
      
      RULES:
      - Phrasing: "Guess the song." or "Name this track."
      - answer: Song title and artist.
      - searchTermAudio: Song title and artist for search.
      - Difficulty: ${difficulty}`;

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 500
    })
  });

  const data = await response.json();
  let text = data.choices[0]?.message?.content || '{}';
  text = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(text);
}

export default generateBoard;

/**
 * Generates a mock board for offline dev testing.
 */
function generateMockBoard(categories: string[], settings: GameSettings): Board {
  const values = POINT_VALUES[settings.questionsPerCategory];
  return categories.map(cat => {
    const isVisual = cat.toLowerCase().endsWith(' -v');
    const isAudio = cat.toLowerCase().endsWith(' -a');
    const cleanCat = cat.replace(/\s*-[v|a]\s*$/i, '').trim();
    
    return {
      category: cleanCat,
      questions: values.map((v, i) => ({
        value: v,
        question: isAudio ? "Guess the song:" : `[MOCK] ${cleanCat} question #${i + 1} for ${v} points?`,
        answer: isAudio ? `Mock Song ${i + 1}` : `Mock Answer ${i + 1}`,
        status: 'hidden' as const,
        ...(isVisual ? { searchTerm: 'Albert Einstein' } : {}),
        ...(isAudio ? { searchTermAudio: 'Bohemian Rhapsody Queen' } : {})
      }))
    };
  });
}
