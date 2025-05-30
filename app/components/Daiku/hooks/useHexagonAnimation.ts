import { useState, useEffect, useMemo } from "react";
import { GridPosition, HexagonData, PlayerEntity, TerrainDefinition } from "../utils/types";

interface UseHexagonAnimationProps {
  allGridPositions: GridPosition[];
  animationDelay: number;
  terrainMap: Map<string, TerrainDefinition>;
  defaultTerrain: TerrainDefinition;
  playerEntities: PlayerEntity[];
}

/**
 * Custom hook to handle the animation of hexagons appearing one by one
 *
 * @param allGridPositions Array of grid positions to add in sequence
 * @param animationDelay Delay in milliseconds between adding each hexagon
 * @param terrainMap Map of terrain types for each position
 * @param defaultTerrain Default terrain to use if not found in map
 * @param playerEntities Array of player entities to check for entities at positions
 * @returns Array of visible hexagons with their terrain and entity data
 */
export const useHexagonAnimation = ({
  allGridPositions,
  animationDelay,
  terrainMap,
  defaultTerrain,
  playerEntities,
}: UseHexagonAnimationProps): HexagonData[] => {
  // Get the center tile for the initial hexagon (and its terrain)
  const centerPos = { q: 0, r: 0 };
  const centerTerrain = terrainMap.get("0,0") || defaultTerrain;
  const initialHexagon = { q: centerPos.q, r: centerPos.r, terrain: centerTerrain };
  const [visibleHexagons, setVisibleHexagons] = useState<HexagonData[]>([initialHexagon]);

  const hexagonSequence = useMemo(() => {
    return allGridPositions.filter((pos) => !(pos.q === 0 && pos.r === 0));
  }, [allGridPositions]);

  useEffect(() => {
    // Function to add the next hexagon in sequence
    const addNextHexagon = (index: number) => {
      // Remove the center position as it's already visible

      if (index >= hexagonSequence.length) return;

      const timer = setTimeout(() => {
        // Get the hexagon position
        const hexPosition = hexagonSequence[index];
        // Get its pre-generated terrain
        const posKey = `${hexPosition.q},${hexPosition.r}`;
        const hexTerrain = terrainMap.get(posKey) || defaultTerrain;

        // Check if there's an entity at this position
        const entityAtPosition = playerEntities.find(
          (entity) => entity.position.q === hexPosition.q && entity.position.r === hexPosition.r
        );

        setVisibleHexagons((prev) => [
          ...prev,
          {
            ...hexPosition,
            terrain: hexTerrain,
            entity: entityAtPosition,
          },
        ]);

        // Schedule the next hexagon
        addNextHexagon(index + 1);
      }, animationDelay);

      return () => clearTimeout(timer);
    };

    // Start adding hexagons after a short delay
    const initialTimer = setTimeout(() => {
      addNextHexagon(0);
    }, 500);

    return () => clearTimeout(initialTimer);
  }, [hexagonSequence, animationDelay, terrainMap, defaultTerrain, playerEntities]);

  return visibleHexagons;
};
