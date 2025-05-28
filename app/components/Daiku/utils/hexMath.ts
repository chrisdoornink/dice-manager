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

export const calculateGridDimensions = (
  visibleHexagons: GridPosition[],
  hexSize: number,
  hexWidth: number,
  hexHeight: number
) => {
  if (visibleHexagons.length === 0)
    return { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };

  // Convert all hexagon positions to pixel coordinates
  const pixelPositions = visibleHexagons.map((position) => {
    const xPosition = hexSize * ((3 / 2) * position.q);
    const yPosition = hexSize * ((Math.sqrt(3) / 2) * position.q + Math.sqrt(3) * position.r);
    const yPositionInverted = -yPosition;

    return {
      x: xPosition,
      y: yPositionInverted,
    };
  });

  // Find min and max coordinates
  const minX = Math.min(...pixelPositions.map((p) => p.x)) - hexWidth / 2;
  const maxX = Math.max(...pixelPositions.map((p) => p.x)) + hexWidth / 2;
  const minY = Math.min(...pixelPositions.map((p) => p.y)) - hexHeight / 2;
  const maxY = Math.max(...pixelPositions.map((p) => p.y)) + hexHeight / 2;

  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    maxX,
    minY,
    maxY,
  };
};
