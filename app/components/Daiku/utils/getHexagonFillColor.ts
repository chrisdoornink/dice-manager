import { HexagonData, GameEntity, PlayerEntity, EnemyEntity, GridPosition } from "./types";

export const getHexagonFillColor = (
  position: HexagonData,
  selectedEntity: GameEntity | null,
  movementRangeHexagons: GridPosition[],
  playerEntities: PlayerEntity[],
  enemyEntities: EnemyEntity[],
  pendingMoves: Map<string, GridPosition>
): string => {
  // Check if hexagon is hovered
  // if (hoveredHexagon && hoveredHexagon.q === position.q && hoveredHexagon.r === position.r) {
  //   return `${position.terrain.color}80`;
  // }

  if (position.terrain.type === "water") return "#5DA9E9";

  // Check if hexagon is in movement range
  if (
    selectedEntity &&
    movementRangeHexagons.some((pos) => pos.q === position.q && pos.r === position.r)
  ) {
    // Don't highlight if another entity is already there
    const isOccupiedByOtherPlayer = playerEntities.some(
      (e) =>
        e.id !== selectedEntity.id && e.position.q === position.q && e.position.r === position.r
    );

    // Check if enemy is there
    const isOccupiedByEnemy = enemyEntities.some(
      (e) => e.position.q === position.q && e.position.r === position.r
    );

    // Check if another pending move is targeting this position
    const isTargetedByPendingMove = Array.from(pendingMoves.entries()).some(
      ([entityId, pendingPos]) =>
        entityId !== selectedEntity.id && pendingPos.q === position.q && pendingPos.r === position.r
    );

    // If occupied or targeted by pending move, don't highlight
    if (isOccupiedByOtherPlayer || isOccupiedByEnemy || isTargetedByPendingMove) {
      return position.terrain.color; // Return normal terrain color
    }

    // Make all terrain types lighter when highlighted in movement range
    if (position.terrain.type === "grass") return "#E5FFD4"; // Lighter shade of green for grass
    if (position.terrain.type === "forest") return "#A3D682"; // Lighter green for forest
    if (position.terrain.type === "mountain") return "#B8E6B8"; // Lighter green for mountain
    return `${position.terrain.color}80`; // 80% opacity as fallback for other terrain types
  }

  // Check if hexagon is a highlighted neighbor
  // if (highlightedNeighbors.some((n) => n.q === position.q && n.r === position.r)) {
  //   return `${position.terrain.color}80`; // Terrain color with 50% opacity for highlighted neighbors
  // }

  // Default - use terrain color
  return position.terrain.color;
};
