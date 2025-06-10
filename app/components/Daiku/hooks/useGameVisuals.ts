import React from 'react';
import { GridPosition, HexagonData, TerrainDefinition, PlayerEntity } from '../utils/types';
import { useHexagonAnimation } from './useHexagonAnimation';
import { ANIMATION_DELAY, TERRAIN_TYPES } from '../utils/generateTerrainMap';

interface UseGameVisualsProps {
  allGridPositions: GridPosition[];
  terrainMap: Map<string, TerrainDefinition>;
  gridInitialized: boolean;
  setGridInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useGameVisuals = ({
  allGridPositions,
  terrainMap,
  gridInitialized,
  setGridInitialized,
}: UseGameVisualsProps) => {
  // Use the animation hook only for initial grid setup
  const animatedHexagons = useHexagonAnimation({
    allGridPositions,
    animationDelay: ANIMATION_DELAY,
    terrainMap,
    defaultTerrain: TERRAIN_TYPES.grass,
    playerEntities: [], // Remove dependency on playerEntities to prevent re-animations
  });

  // Create a static grid representation for subsequent renders
  const staticHexagons = React.useMemo(() => {
    return allGridPositions.map((pos) => {
      const posKey = `${pos.q},${pos.r}`;
      const terrain = terrainMap.get(posKey) || TERRAIN_TYPES.grass;
      return { q: pos.q, r: pos.r, terrain } as HexagonData;
    });
  }, [allGridPositions, terrainMap]);

  // Only use animation on initial load, not for every state update
  const visibleHexagons = React.useMemo(() => {
    // Once we've seen the animation once, use static grid for all future renders
    if (animatedHexagons.length === allGridPositions.length && !gridInitialized) {
      setGridInitialized(true);
    }

    return gridInitialized ? staticHexagons : animatedHexagons;
  }, [animatedHexagons, staticHexagons, allGridPositions.length, gridInitialized, setGridInitialized]);

  return {
    visibleHexagons
  };
};

export default useGameVisuals;
