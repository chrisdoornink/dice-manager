import { useMemo } from 'react';
import { HexagonData, GridPosition, PlayerEntity } from '../utils/types';

interface UseHexagonCursorProps {
  position: HexagonData;
  selectedEntity: PlayerEntity | null;
  movementRangeHexagons: GridPosition[];
  customCursors: { [key: string]: string };
}

/**
 * Hook to determine the appropriate cursor style for a hexagon
 * based on the selected entity and whether the hexagon is in movement range
 */
export const useHexagonCursor = ({
  position,
  selectedEntity,
  movementRangeHexagons,
  customCursors,
}: UseHexagonCursorProps): string => {
  // Calculate if the current position is in the movement range
  const isInMovementRange = useMemo(() => {
    return selectedEntity && 
      movementRangeHexagons.some(
        (pos) => pos.q === position.q && pos.r === position.r
      );
  }, [selectedEntity, movementRangeHexagons, position]);

  // Determine cursor style based on selected entity and movement range
  const cursorStyle = useMemo(() => {
    if (!isInMovementRange) {
      return 'pointer';
    }

    // No selected entity means use default pointer
    if (!selectedEntity) {
      return 'pointer';
    }

    // Determine cursor based on entity type
    switch (selectedEntity.entityType.type) {
      case 'archer':
        return customCursors.archer || 'crosshair';
      case 'cavalry':
        return customCursors.cavalry || 'crosshair';  
      case 'infantry':
        return customCursors.infantry || 'crosshair';
      default:
        return 'crosshair';
    }
  }, [isInMovementRange, selectedEntity, customCursors]);

  return cursorStyle;
};

export default useHexagonCursor;
