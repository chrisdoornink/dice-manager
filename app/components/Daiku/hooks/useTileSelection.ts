import { useCallback } from 'react';
import { HexagonData, PlayerEntity, GameEntity, GridPosition } from '../utils/types';

interface UseTileSelectionProps {
  playerEntities: PlayerEntity[];
  enemyEntities: any[];
  pendingMoves: Map<string, GridPosition>;
  selectedEntity: PlayerEntity | null;
  movementRangeHexagons: GridPosition[];
  setErrorMessage: (message: string) => void;
  setPendingMoves: React.Dispatch<React.SetStateAction<Map<string, GridPosition>>>;
  setSelectedEntity: React.Dispatch<React.SetStateAction<PlayerEntity | null>>;
  setIsSelectingDestination: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTileSelection = ({
  playerEntities,
  enemyEntities,
  pendingMoves,
  selectedEntity,
  movementRangeHexagons,
  setErrorMessage,
  setPendingMoves,
  setSelectedEntity,
  setIsSelectingDestination,
}: UseTileSelectionProps) => {
  // Handle tile selection for movement/attack
  const handleTileSelection = useCallback(
    (targetPosition: HexagonData) => {
      if (!selectedEntity) return;

      // Check if the target position will be occupied after all pending moves
      const willBeOccupied = () => {
        // Get all entities (both player and enemy)
        const allEntities = [...playerEntities, ...enemyEntities];

        // First, check if any entity without a pending move will be at the target position
        const entityAtTarget = allEntities.find((entity) => {
          // Skip the currently selected entity since it's moving
          if (entity.id === selectedEntity.id) return false;

          // If this entity has a pending move, skip it (its current position will be vacated)
          if (pendingMoves.has(entity.id)) return false;

          // Check if this entity's position matches the target position
          return entity.position.q === targetPosition.q && entity.position.r === targetPosition.r;
        });

        if (entityAtTarget) return true;

        // Next, check if any other entity has a pending move to this same position
        const pendingMoveToTarget = Array.from(pendingMoves.entries()).some(
          ([entityId, position]) => {
            // Skip the currently selected entity
            if (entityId === selectedEntity.id) return false;

            // Check if another entity is moving to this same position
            return position.q === targetPosition.q && position.r === targetPosition.r;
          }
        );

        return pendingMoveToTarget;
      };

      // Check if the selected position is within the movement range
      const isWithinMovementRange = movementRangeHexagons.some(
        (pos) => pos.q === targetPosition.q && pos.r === targetPosition.r
      );

      if (!isWithinMovementRange) {
        // Position is out of range
        setErrorMessage("Position is out of movement range");
        return;
      }

      if (willBeOccupied()) {
        // Position will be occupied by another entity
        setErrorMessage("Position will be occupied by another entity");
        return;
      }

      // Create a new map to avoid mutating the state directly
      const newPendingMoves = new Map(pendingMoves);
      
      // Add or update the pending move for this entity
      newPendingMoves.set(selectedEntity.id, {
        q: targetPosition.q,
        r: targetPosition.r,
      });
      
      // Update the pending moves state
      setPendingMoves(newPendingMoves);

      // Clear the selected entity and destination selection mode
      setSelectedEntity(null);
      setIsSelectingDestination(false);
    },
    [
      selectedEntity,
      playerEntities,
      enemyEntities,
      pendingMoves,
      movementRangeHexagons,
      setErrorMessage,
      setPendingMoves,
      setSelectedEntity,
      setIsSelectingDestination,
    ]
  );

  return {
    handleTileSelection,
  };
};

export default useTileSelection;
