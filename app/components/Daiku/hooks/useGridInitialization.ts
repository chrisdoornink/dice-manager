import { useState, useEffect } from 'react';
import { GridPosition } from '../utils/types';
import { createHexagonalGrid } from './useHexagonalGrid';

export const useGridInitialization = () => {
  const [allGridPositions, setAllGridPositions] = useState<GridPosition[]>([]);
  
  // Use a state to track if the grid has been initialized
  const [gridInitialized, setGridInitialized] = useState(false);

  useEffect(() => {
    const gridPositions = createHexagonalGrid();
    setAllGridPositions(gridPositions);
  }, []);

  return {
    allGridPositions,
    setAllGridPositions,
    gridInitialized,
    setGridInitialized
  };
};

export default useGridInitialization;
