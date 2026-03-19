import { useState, useCallback } from 'react';

export function useGame() {
  const [score, setScore] = useState(0);

  const addScore = useCallback((amount: number) => {
    setScore(prev => prev + amount);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  return { score, addScore, resetScore };
}
