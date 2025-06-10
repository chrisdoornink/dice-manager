import { useState } from 'react';
import { GridPosition } from '../utils/types';

export const useHexagonHighlight = () => {
  // Track which hexagons are highlighted as neighbors
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<GridPosition[]>([]);

  // Track the currently hovered hexagon
  const [hoveredHexagon, setHoveredHexagon] = useState<GridPosition | null>(null);

  return {
    highlightedNeighbors,
    setHighlightedNeighbors,
    hoveredHexagon,
    setHoveredHexagon
  };
};

export default useHexagonHighlight;
