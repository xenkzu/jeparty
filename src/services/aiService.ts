import { Board } from '../types/game';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'qwen/qwen3-32b';

/**
 * Generates a complete Jeopardy game board using Groq (OpenAI-compatible).
 *
 * @param categories - Array of 5 category names to generate questions for.
 * @returns A promise that resolves to a Board object.
 */
export const generateBoard = async (categories: string[]): Promise<Board> => {
  const visualCategories = categories.filter(c => c.toLowerCase().endsWith(' -v'));
  const promptCategories = categories.map(c => c.replace(/ -v$/i, ''));
  
  const prompt = `Generate a complete Jeopardy game board for these 5 categories: ${promptCategories.join(', ')}.
      Return ONLY valid JSON, no markdown, no backticks, no explanation.
      A JSON array of exactly 5 objects: { category: string, questions: [] }
      Each question object: { value: number, question: string, answer: string, status: 'hidden', searchTerm?: string }
      
      SPECIAL INSTRUCTION:
      For categories matching these exactly: [${visualCategories.map(c => c.replace(/ -v$/i, '')).join(', ')}], the searchTerm field must follow these strict rules:
       - Must be the exact proper noun Wikipedia would have a page for
       - Format: 'Firstname Lastname' for people, 'Character Name anime/show' for fictional characters
       - GOOD examples: 'Monkey D Luffy', 'Sasuke Uchiha', 'Albert Einstein', 'Eiffel Tower'
       - BAD examples: 'anime character', 'famous scientist', 'guess who', 'popular character'
       - If you cannot think of a specific Wikipedia-searchable entity, pick a different question
       - The answer field must match the searchTerm subject exactly
       - The question text should be "Guess the character" or "Who is this?".
      
      For all other categories, DO NOT include a searchTerm field.
      Make questions fun/casual. Each category must have exactly 5 questions (100, 200, 300, 400, 500).
      Keep each question under 15 words and each answer under 5 words to save space.`;

  try {
    if (!API_KEY) {
      throw new Error('VITE_GROQ_API_KEY is not defined in the environment.');
    }

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
        max_tokens: 4000,
        reasoning_format: "hidden"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content;

    if (!text) {
      throw new Error('No content returned from Groq.');
    }

    // Strip any markdown code fences if AI ignores instructions
    text = text.replace(/```json\n?|```/g, '').trim();

    const board: Board = JSON.parse(text);

    // Basic structure validation
    // Verification check for board structure
    if (!Array.isArray(board) || board.length !== 5) {
      throw new Error('Invalid board structure from AI: Expected 5 categories');
    }

    for (const cat of board) {
      if (!cat.category || !Array.isArray(cat.questions) || cat.questions.length !== 5) {
        throw new Error('Invalid board structure from AI: Each category must have 5 questions');
      }
    }

    return board;
  } catch (error) {
    console.error('Board Generation Failure:', error);
    throw error instanceof Error ? error : new Error('Fatal error generating AI board.');
  }
};

export default generateBoard;
