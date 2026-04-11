// src/services/persistenceService.ts

const SAVE_KEY = 'jeparty_game_v1';

export interface PersistedState {
  gameState: import('../types/game').Game;
  currentScreen: 'GAME' | 'QUESTION';
  savedAt: number;
}

export function saveGame(
  gameState: import('../types/game').Game,
  currentScreen: 'GAME' | 'QUESTION'
): void {
  try {
    const payload: PersistedState = {
      gameState,
      currentScreen,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function loadGame(): PersistedState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    // Reject saves older than 24 hours
    if (Date.now() - parsed.savedAt > 86400000) {
      clearGame();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  localStorage.removeItem(SAVE_KEY);
}
