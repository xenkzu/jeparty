import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Handle CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'Missing or invalid categories' });
  }

  const API_KEY = process.env.VITE_GROQ_API_KEY;
  const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL = 'qwen/qwen3-32b';

  const visualCategories = categories.filter(c => c.toLowerCase().endsWith(' -v'));
  const promptCategories = categories.map(c => c.replace(/ -v$/i, ''));

  const prompt = `Generate a complete Jeopardy game board for these 5 categories: ${promptCategories.join(', ')}.
      Return ONLY valid JSON, no markdown, no backticks, no explanation.
      A JSON array of exactly 5 objects: { category: string, questions: [] }
      Each question object: { value: number, question: string, answer: string, status: 'hidden', searchTerm?: string }
      
      SPECIAL INSTRUCTION:
      For [VISUAL] categories ([${visualCategories.map(c => c.replace(/ -v$/i, '')).join(', ')}]), generate questions that match the category theme exactly.
      However, only generate questions about subjects that have a real Wikipedia page with a thumbnail image.

      Rules:
       - ALWAYS respect the category name and generate questions within that theme
       - For anime categories: use real anime characters that have Wikipedia pages
         GOOD: 'Naruto Uzumaki', 'Goku', 'Monkey D. Luffy', 'Light Yagami'
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
      
      For all other categories, DO NOT include a searchTerm field.
      Make questions fun/casual. Each category must have exactly 5 questions (100, 200, 300, 400, 500).

      QUESTION QUALITY RULES — follow strictly:
       1. Every question MUST be phrased as a question ending with a '?'
          GOOD: 'What is the capital of France?'
          BAD: 'The capital of France', 'Name the capital of France'

       2. Every answer must be short and specific — 1 to 4 words maximum
          GOOD: 'Paris', 'Albert Einstein', 'The Eiffel Tower'
          BAD: 'It is Paris', 'The answer is Einstein'

       3. Questions must NEVER repeat within the same category
          Each of the 5 questions must test a completely different aspect of the category

       4. Questions must NEVER be ambiguous — only one correct answer is possible

      DIFFICULTY SCALING RULES — strictly follow this for every category:
       100 points → Extremely easy, common knowledge, anyone would know this
                    Example for 'Science': 'What planet do we live on?'
       200 points → Easy, basic knowledge, most people would know this
                    Example for 'Science': 'What gas do plants absorb from the air?'
       300 points → Medium, requires some knowledge of the topic
                    Example for 'Science': 'What is the chemical symbol for gold?'
       400 points → Hard, requires good knowledge of the topic
                    Example for 'Science': 'What is the speed of light in km/s?'
       500 points → Expert level, only enthusiasts or experts would know this
                    Example for 'Science': 'What is the half-life of Carbon-14?'

       The difficulty jump between each tier must be noticeable.
       NEVER put a hard question at 100 or an easy question at 500.
       Generate questions in order: 100 first (easiest) → 500 last (hardest)`;

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 5000,
        reasoning_format: "hidden"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `Groq API Error: ${errorData.error?.message || response.statusText}`
      });
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: 'No content returned from Groq' });
    }

    // Strip any markdown code fences
    text = text.replace(/```json\n?|```/g, '').trim();

    try {
      const board = JSON.parse(text);
      // Basic structure validation
      if (!Array.isArray(board) || board.length !== 5) {
        throw new Error('Expected 5 categories');
      }
      return res.status(200).json(board);
    } catch (parseError) {
      console.error('JSON Parse failed:', text);
      return res.status(500).json({ error: 'AI returned invalid JSON structure' });
    }

  } catch (error) {
    console.error('Serverless function failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
