import { useState } from 'react';
import { GridPosition, PlayerEntity } from '../utils/types';

export const useEntitySelection = () => {
  // Track selected entity for movement range display
  const [selectedEntity, setSelectedEntity] = useState<PlayerEntity | null>(null);

  // Track which hexagons are within movement range of selected entity
  const [movementRangeHexagons, setMovementRangeHexagons] = useState<GridPosition[]>([]);

  // Track if we're in tile selection mode (selecting a destination for movement/attack)
  const [isSelectingDestination, setIsSelectingDestination] = useState<boolean>(false);

  return {
    selectedEntity,
    setSelectedEntity,
    movementRangeHexagons,
    setMovementRangeHexagons,
    isSelectingDestination,
    setIsSelectingDestination
  };
};

export default useEntitySelection;
