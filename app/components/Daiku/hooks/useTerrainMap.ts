import { useState, useEffect } from "react";
import { GridPosition, TerrainDefinition } from "../utils/types";
import { generateTerrainMap } from "../utils/generateTerrainMap";

export const useTerrainMap = (allGridPositions: GridPosition[]) => {
  // Pre-generate a terrain map to ensure connectivity
  const [terrainMap, setTerrainMap] = useState<Map<string, TerrainDefinition>>(new Map());

  useEffect(() => {
    if (allGridPositions.length > 0) {
      const newTerrainMap = generateTerrainMap(allGridPositions);
      setTerrainMap(newTerrainMap);
    }
  }, [allGridPositions]);

  return {
    terrainMap,
    setTerrainMap,
  };
};

export default useTerrainMap;
