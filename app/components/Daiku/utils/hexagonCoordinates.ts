import { GridPosition } from './types';

/**
 * Converts axial coordinates to pixel coordinates for flat-topped hexagons
 * @param position The axial coordinates (q, r)
 * @param hexSize The size of the hexagon
 * @returns The x, y pixel coordinates
 */
export const axialToPixel = (position: GridPosition, hexSize: number): { x: number, y: number } => {
  // Standard spacing factors for perfect hexagonal packing
  const horizontalSpacingFactor = 1.5;
  const verticalSpacingFactor = Math.sqrt(3);

  // Calculate x and y positions
  const x = hexSize * (horizontalSpacingFactor * position.q);
  
  // Note: y is inverted to make positive r go upward in the grid
  const y = -(hexSize * ((verticalSpacingFactor / 2) * position.q + verticalSpacingFactor * position.r));

  return { x, y };
};

/**
 * Calculates the viewBox dimensions for an SVG hexagon
 * @param hexSize Base size of hexagon
 * @returns Width and height for the hexagon
 */
export const calculateHexagonDimensions = (hexSize: number): { width: number, height: number } => {
  // These calculations create a properly sized viewBox for the hexagon
  const hexWidth = hexSize * 2;
  const hexHeight = Math.sqrt(3) * hexSize;
  
  return { width: hexWidth, height: hexHeight };
};

/**
 * Default spacing factors used for hexagonal grid layout
 */
export const DEFAULT_SPACING = {
  horizontal: 1.5,
  vertical: Math.sqrt(3)
};
