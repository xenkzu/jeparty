import { GameState } from '../types/game';

const initialState: GameState = {
  currentScreen: 'SETUP',
  score: 0,
};

// Example of a simple store-like object if needed later.
// For now, state is managed in App.tsx as requested.
export let gameState: GameState = { ...initialState };

export const resetGameState = () => {
  gameState = { ...initialState };
};

export const updateGameState = (updates: Partial<GameState>) => {
  gameState = { ...gameState, ...updates };
};
