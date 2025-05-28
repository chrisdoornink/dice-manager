import { getNeighboringTiles } from "./getNeigboringTiles";
import { GridPosition, TerrainDefinition, TerrainType } from "./types";

// CONFIGURABLE GRID PARAMETERS
// Boundary coordinates for rectangular grid using useMemo to prevent recreating on each render
export const GRID_BOUNDS = {
  qMin: -3, // Leftmost column
  qMax: 3, // Rightmost column
  rMin: -2, // Bottom row at leftmost edge [-3,-2]
  rMax: 6, // Top row
};

export const ANIMATION_DELAY = 80; // Milliseconds between adding each hexagon

export const generateTerrainMap = (positions: GridPosition[]) => {
  const newMap = new Map<string, TerrainDefinition>();

  // For the center tile, randomly choose any non-water terrain
  const centerTerrainOptions = [TERRAIN_TYPES.grass, TERRAIN_TYPES.forest, TERRAIN_TYPES.mountain];
  const randomCenterTerrain =
    centerTerrainOptions[Math.floor(Math.random() * centerTerrainOptions.length)];
  newMap.set("0,0", randomCenterTerrain);

  // First generate terrain for all non-edge tiles
  for (const pos of positions.filter(
    (p) =>
      !(p.q === 0 && p.r === 0) && // Skip center (already set)
      p.q !== GRID_BOUNDS.qMin &&
      p.q !== GRID_BOUNDS.qMax &&
      p.r !== GRID_BOUNDS.rMin &&
      p.r !== GRID_BOUNDS.rMax
  )) {
    getRandomTerrain(pos, newMap);
  }

  // Then handle edge tiles to ensure connectivity
  for (const pos of positions.filter(
    (p) =>
      p.q === GRID_BOUNDS.qMin ||
      p.q === GRID_BOUNDS.qMax ||
      p.r === GRID_BOUNDS.rMin ||
      p.r === GRID_BOUNDS.rMax
  )) {
    getRandomTerrain(pos, newMap);
  }

  return newMap;
};

// Helper function to get a random terrain type with probabilities
const getRandomTerrain = (
  position: GridPosition,
  existingTerrain: Map<string, TerrainDefinition>
) => {
  const posKey = `${position.q},${position.r}`;

  // Check if terrain is already assigned
  if (existingTerrain.has(posKey)) {
    return existingTerrain.get(posKey)!;
  }

  // Get neighboring cells
  const neighbors = getNeighboringTiles(position);
  const neighborTerrains: TerrainDefinition[] = [];

  // Check what terrain the neighbors have
  for (const neighbor of neighbors) {
    const neighborKey = `${neighbor.q},${neighbor.r}`;
    if (existingTerrain.has(neighborKey)) {
      neighborTerrains.push(existingTerrain.get(neighborKey)!);
    }
  }

  // If this is an edge tile, reduce the chance of water
  const isEdgeTile =
    position.q === GRID_BOUNDS.qMin ||
    position.q === GRID_BOUNDS.qMax ||
    position.r === GRID_BOUNDS.rMin ||
    position.r === GRID_BOUNDS.rMax;

  // Calculate probabilities based on location and neighbors
  let waterProbability = 0.25; // Base water probability
  let mountainProbability = 0.2;
  let forestProbability = 0.3;
  let grassProbability = 0.25;

  // Edge tiles have much lower water probability to avoid isolation
  if (isEdgeTile) {
    waterProbability = 0.05;
    grassProbability = 0.5;
  }

  // If neighbors include water, reduce chance of more water to avoid isolation
  const waterNeighbors = neighborTerrains.filter((t) => t.type === "water").length;
  if (waterNeighbors > 0) {
    // Reduce water probability based on how many water neighbors exist
    waterProbability = Math.max(0.05, waterProbability - waterNeighbors * 0.08);
    grassProbability += waterNeighbors * 0.05;
  }

  // If neighbors include mountains, slightly increase chance of more mountains
  const mountainNeighbors = neighborTerrains.filter((t) => t.type === "mountain").length;
  if (mountainNeighbors > 0) {
    mountainProbability += mountainNeighbors * 0.05;
  }

  // If neighbors include forest, slightly increase chance of more forest
  const forestNeighbors = neighborTerrains.filter((t) => t.type === "forest").length;
  if (forestNeighbors > 0) {
    forestProbability += forestNeighbors * 0.05;
  }

  // Normalize probabilities
  const totalProb = waterProbability + mountainProbability + forestProbability + grassProbability;
  waterProbability /= totalProb;
  mountainProbability /= totalProb;
  forestProbability /= totalProb;
  grassProbability /= totalProb;

  // Choose terrain based on calculated probabilities
  const random = Math.random();
  let terrain;

  if (random < waterProbability) {
    terrain = TERRAIN_TYPES.water;
  } else if (random < waterProbability + mountainProbability) {
    terrain = TERRAIN_TYPES.mountain;
  } else if (random < waterProbability + mountainProbability + forestProbability) {
    terrain = TERRAIN_TYPES.forest;
  } else {
    terrain = TERRAIN_TYPES.grass;
  }

  // Store the terrain
  existingTerrain.set(posKey, terrain);
  return terrain;
};

// Define terrain types and their colors
export const TERRAIN_TYPES = {
  grass: { type: "grass" as TerrainType, color: "#7EC850" },
  mountain: { type: "mountain" as TerrainType, color: "#A0A0A0" },
  forest: { type: "forest" as TerrainType, color: "#2D8659" },
  water: { type: "water" as TerrainType, color: "#5DA9E9" },
};
