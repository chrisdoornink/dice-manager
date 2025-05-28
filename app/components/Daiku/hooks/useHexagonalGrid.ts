import { GridPosition } from "../utils/types";
import { GRID_BOUNDS } from "../utils/generateTerrainMap";
import { useMemo } from "react";

export const useHexagonalGrid = () => {
  return useMemo(() => {
    const positions: GridPosition[] = [];

    // List of hexagons to exclude (explicitly not visible)
    const excludedHexagons = [
      { q: -2, r: -3 },
      { q: -1, r: -4 },
      { q: 0, r: -4 },
      { q: 1, r: -5 },
      { q: 2, r: -5 },
      { q: 2, r: -6 },
      { q: 3, r: -6 },
    ];

    // List of hexagons to force include (even if outside calculated boundaries)
    const includedHexagons = [
      { q: -1, r: 5 },
      { q: 0, r: 4 },
      { q: 1, r: 4 },
    ];

    // Helper function to check if a position should be excluded
    const isExcluded = (pos: GridPosition): boolean => {
      return excludedHexagons.some((h) => h.q === pos.q && h.r === pos.r);
    };

    // Helper function to check if a position should be forcibly included
    const isForcedInclusion = (pos: GridPosition): boolean => {
      return includedHexagons.some((h) => h.q === pos.q && h.r === pos.r);
    };

    // Generate a rectangular grid with the specified boundaries
    for (let q = GRID_BOUNDS.qMin; q <= GRID_BOUNDS.qMax; q++) {
      // Calculate the r range based on q to create the rectangular shape
      // For mobile, we want it taller in the vertical direction
      // Adjust r boundaries based on q position to create the specified shape
      let rMin = GRID_BOUNDS.rMin;
      let rMax = GRID_BOUNDS.rMax;

      // Apply constraints for the diagonal edge (top-right and bottom-right)
      // This creates the specified corner points: [-3,6], [3,3], [-3,-2], [3,-6]
      if (q > GRID_BOUNDS.qMin) {
        // Adjust top boundary (decreases as q increases)
        rMax = Math.max(GRID_BOUNDS.rMax - (q - GRID_BOUNDS.qMin), 3);

        // Adjust bottom boundary based on q to create the proper diagonal
        // From [-3,-2] to [3,-6] we need to decrease by 2/3 units per q step
        // For each q unit increase, r decreases by 4/6 units
        const bottomSlope = 4 / 6; // How much r decreases per q increase
        rMin = Math.floor(GRID_BOUNDS.rMin - bottomSlope * (q - GRID_BOUNDS.qMin));

        // Make sure we don't go below -6 for any q
        rMin = Math.max(rMin, -6);
      }

      for (let r = rMin; r <= rMax; r++) {
        const position = { q, r };
        // Only add this position if it's not in the excluded list
        if (!isExcluded(position)) {
          positions.push(position);
        }
      }
    }

    // Add any forced inclusions that weren't already added
    for (const position of includedHexagons) {
      // Check if this position is already in the positions array
      const alreadyExists = positions.some((p) => p.q === position.q && p.r === position.r);

      // If not already in the positions array, add it
      if (!alreadyExists) {
        positions.push(position);
      }
    }
    // Sort positions by distance from center (0,0) for animation purposes
    return positions.sort((a, b) => {
      // In axial coordinates, distance from origin is calculated with Manhattan distance formula
      const distA = (Math.abs(a.q) + Math.abs(a.r) + Math.abs(a.q + a.r)) / 2;
      const distB = (Math.abs(b.q) + Math.abs(b.r) + Math.abs(b.q + b.r)) / 2;
      return distA - distB;
    });
  }, []);
};
