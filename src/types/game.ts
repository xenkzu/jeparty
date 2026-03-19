export interface GameState {
  currentScreen: 'SETUP' | 'GAME' | 'QUESTION' | 'END';
  score: number;
}

export interface Question {
  id: string;
  category: string;
  points: number;
  question: string;
  answer: string;
  wasAnswered: boolean;
}
