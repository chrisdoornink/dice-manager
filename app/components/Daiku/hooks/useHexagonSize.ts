import { useMemo } from "react";
import { GRID_BOUNDS } from "../utils/generateTerrainMap";

export const useHexagonSize = ({
  windowDimensions,
}: {
  windowDimensions: { width: number; height: number };
}) => {
  // Calculate optimal hexagon size based on window dimensions and grid bounds
  const hexSize = useMemo(() => {
    // Estimate the grid dimensions in logical units
    const logicalWidth = GRID_BOUNDS.qMax - GRID_BOUNDS.qMin + 1;
    const logicalHeight = GRID_BOUNDS.rMax - GRID_BOUNDS.rMin + 1;

    // Apply safety margins for container padding
    const safetyFactor = 0.85; // Use 85% of the available space
    // Account for mobile vs desktop - use more aggressive scaling on smaller screens
    const isMobile = windowDimensions.width < 768;
    const mobileFactor = isMobile ? 0.95 : 0.85;
    const availableWidth = windowDimensions.width * mobileFactor;
    const availableHeight = windowDimensions.height * mobileFactor;

    // Calculate size constraints based on logical dimensions
    // For horizontal constraint: we need 1.5*q hexagons to fit in width (due to overlapping)
    // For vertical constraint: we need sqrt(3)*r hexagons to fit in height
    const widthConstraint = availableWidth / (logicalWidth * 1.5);
    const heightConstraint = availableHeight / (logicalHeight * Math.sqrt(3));

    // Choose the smaller of the two constraints
    const baseSize = Math.min(widthConstraint, heightConstraint);

    // Apply a minimum size to ensure hexagons aren't too small
    // And a maximum size to ensure they don't get too large on big screens
    return Math.min(Math.max(baseSize, 20), 60);
  }, [windowDimensions]);

  // Calculate the dimensions of a hexagon based on size
  // For a regular hexagon with flat tops:
  const hexWidth = 2 * hexSize; // Width = 2 × radius
  const hexHeight = Math.sqrt(3) * hexSize; // Height = √3 × radius

  return [hexSize, hexWidth, hexHeight];
};
