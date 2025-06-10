import { useState } from 'react';
import { GridPosition } from '../utils/types';

export const useEnemyTurn = () => {
  // Enemy turn tracking
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [enemyPendingMoves, setEnemyPendingMoves] = useState<Map<string, GridPosition>>(new Map());

  return {
    isEnemyTurn,
    setIsEnemyTurn,
    enemyPendingMoves,
    setEnemyPendingMoves
  };
};

export default useEnemyTurn;
