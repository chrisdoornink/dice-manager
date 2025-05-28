import { GridPosition } from "./types";

export const getNeighboringTiles = (pos: GridPosition): GridPosition[] => {
  // The six directions to adjacent hexagons in axial coordinates
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  return directions.map((dir) => ({
    q: pos.q + dir.q,
    r: pos.r + dir.r,
  }));
};
