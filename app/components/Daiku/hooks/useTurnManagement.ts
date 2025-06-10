import { useState } from 'react';

export const useTurnManagement = () => {
  // Track game turns
  const [currentTurn, setCurrentTurn] = useState<number>(1);

  return {
    currentTurn,
    setCurrentTurn
  };
};

export default useTurnManagement;
