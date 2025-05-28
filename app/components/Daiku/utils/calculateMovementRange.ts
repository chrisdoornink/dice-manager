import { GridPosition, PlayerEntity, TerrainDefinition } from "./types";
import { getNeighboringTiles } from "./getNeigboringTiles";

/**
 * Calculates the movement range for a given entity
 * @param entity The entity to calculate the movement range for
 * @returns The movement range for the entity
 */
export const calculateMovementRange = (
  entity: PlayerEntity,
  terrainMap: Map<string, TerrainDefinition>
) => {
  const startPos = entity.position;
  const movementPoints = entity.entityType.movement;
  const rangeHexagons: GridPosition[] = [];

  // Simple breadth-first search to find all hexagons within movement range
  const queue: { position: GridPosition; remainingMovement: number }[] = [
    { position: startPos, remainingMovement: movementPoints },
  ];
  const visited = new Set<string>();
  visited.add(`${startPos.q},${startPos.r}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentPos = current.position;
    const currentMovement = current.remainingMovement;

    // Add this position to range (except the starting position)
    if (!(currentPos.q === startPos.q && currentPos.r === startPos.r)) {
      rangeHexagons.push(currentPos);
    }

    // If we have movement points left, explore neighbors
    if (currentMovement > 0) {
      const neighbors = getNeighboringTiles(currentPos);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.q},${neighbor.r}`;

        // Skip if already visited
        if (visited.has(neighborKey)) continue;

        // Get terrain at this position
        const terrainKey = neighborKey;
        const terrainType = terrainMap.get(terrainKey)?.type;

        // Skip water tiles - can't move there
        if (terrainType === "water") continue;

        // Calculate movement cost based on terrain and entity type
        let movementCost = 1; // Default cost

        // Apply terrain specific movement costs
        if (terrainType === "forest" && entity.entityType.abilities.poorInForests) {
          movementCost = 2; // Forests cost 2 movement for cavalry
        }

        // If we have enough movement left, add to queue
        if (currentMovement >= movementCost) {
          queue.push({
            position: neighbor,
            remainingMovement: currentMovement - movementCost,
          });
          visited.add(neighborKey);
        }
      }
    }
  }

  return rangeHexagons;
};
