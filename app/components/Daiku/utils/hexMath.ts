import { GridPosition } from "./types";

// Function to generate exact SVG points for a hexagon
export const generateHexPoints = () => {
  const points = [];
  // Control the size of the hexagon within its SVG container
  // Increasing this number (closer to 50) makes hexagons larger with less padding
  // The maximum would be 50, which would make hexagons touch exactly at corners
  const hexRadius = 57.5; // Previously 48, now 57.5 for tighter packing

  for (let i = 0; i < 6; i++) {
    // For a flat-topped hexagon, angles are at 0, 60, 120, 180, 240, 300 degrees
    const angle = (Math.PI / 180) * (60 * i);
    const x = 50 + hexRadius * Math.cos(angle);
    const y = 50 + hexRadius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};