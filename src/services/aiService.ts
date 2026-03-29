import { Board } from '../types/game';

/**
 * Generates a complete Jeopardy game board by calling the Vercel serverless API.
 * 
 * @param categories - Array of 5 category names to generate questions for.
 * @returns A promise that resolves to a Board object.
 */
export const generateBoard = async (categories: string[]): Promise<Board> => {
  try {
    const response = await fetch('/api/generate-board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const board: Board = await response.json();

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
