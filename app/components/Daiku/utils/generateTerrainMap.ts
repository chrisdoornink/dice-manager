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

  // Choose a terrain type (more grass and forest, less mountain and water)
  let terrain: TerrainDefinition;
  const rand = Math.random();

  if (rand < 0.1) {
    // 10% chance of water
    terrain = TERRAIN_TYPES.water;
  } else if (rand < 0.3) {
    // 20% chance of mountain
    // For mountain tiles, create a copy of the terrain definition and add a random sprite
    terrain = {
      ...TERRAIN_TYPES.mountain,
      spriteSheetSprite: getRandomMountainSprite(), // Assign a random mountain sprite
    };
  } else if (rand < 0.6) {
    // 30% chance of forest
    // For forest tiles, create a copy of the terrain definition and add a random sprite
    terrain = {
      ...TERRAIN_TYPES.forest,
      spriteSheetSprite: getRandomForestSprite(), // Assign a random forest sprite
    };
  } else {
    // 40% chance of grass
    terrain = TERRAIN_TYPES.grass;
  }

  // Store the terrain
  existingTerrain.set(posKey, terrain);
  return terrain;
};

// Define forest sprite variants based on the provided sprite sheet
// We'll use a subset of the sprites that work well in hexagons
export const FOREST_SPRITES = [
  // First row of sprites (likely the best for forest tiles)
  { x: 0, y: 50, width: 256, height: 256 }, // Top-left sprite (single tree)
  { x: 256, y: 50, width: 256, height: 256 }, // Second tree variant
  { x: 512, y: 50, width: 256, height: 256 }, // Third tree variant
  { x: 768, y: 50, width: 256, height: 256 }, // Fourth tree variant

  // Second row sprites
  { x: 0, y: 356, width: 256, height: 256 }, // First tree dense variant
  { x: 256, y: 356, width: 256, height: 256 }, // Second tree dense variant
  { x: 512, y: 356, width: 256, height: 256 }, // Multiple trees variant 1
  { x: 768, y: 356, width: 256, height: 256 }, // Multiple trees variant 2
];

// Define mountain sprite variants based on the sprite sheet
export const MOUNTAIN_SPRITES = [
  // Mountain sprites
  { x: 50, y: 0, width: 256, height: 256 }, // Mountain variant 1
  { x: 376, y: 0, width: 256, height: 256 }, // Mountain variant 2
  { x: 702, y: 0, width: 256, height: 256 }, // Mountain variant 3

  // Second row of mountain sprites
  { x: 50, y: 256, width: 256, height: 256 }, // Mountain variant 4
  { x: 396, y: 256, width: 256, height: 256 }, // Mountain variant 5
  { x: 702, y: 256, width: 256, height: 256 }, // Mountain variant 6

  // Third row of mountain sprites
  { x: 50, y: 512, width: 256, height: 256 }, // Mountain variant 7
  { x: 376, y: 512, width: 256, height: 256 }, // Mountain variant 8
  { x: 702, y: 512, width: 256, height: 256 }, // Mountain variant 9
];

// Pick a random coordinate adjustment to make the trees appear in different positions
// within the hexagon for visual variety
export const FOREST_OFFSETS = [
  { x: 0, y: 0 }, // Centered
  // { x: -10, y: 0 }, // Slight left
  // { x: 10, y: 0 }, // Slight right
  // { x: 0, y: -10 }, // Slight up
  // { x: 0, y: 10 }, // Slight down
  // { x: -10, y: -10 }, // Upper left
  // { x: 10, y: -10 }, // Upper right
  // { x: -10, y: 10 }, // Lower left
  // { x: 10, y: 10 }, // Lower right
];

// Same offsets can be used for mountains
export const MOUNTAIN_OFFSETS = [...FOREST_OFFSETS];

// Helper function to get a random forest sprite with random position offset
export const getRandomForestSprite = () => {
  // Select a random sprite from the sprite sheet
  const randomSpriteIndex = Math.floor(Math.random() * FOREST_SPRITES.length);
  const sprite = FOREST_SPRITES[randomSpriteIndex];

  // Select a random offset to position the sprite within the hexagon
  const randomOffsetIndex = Math.floor(Math.random() * FOREST_OFFSETS.length);
  const offset = FOREST_OFFSETS[randomOffsetIndex];

  return {
    spritesheet: "/images/terrain/forest_sprites.png",
    x: sprite.x + offset.x,
    y: sprite.y + offset.y,
    width: sprite.width,
    height: sprite.height,
  };
};

// Helper function to get a random mountain sprite with random position offset
export const getRandomMountainSprite = () => {
  // Select a random sprite from the sprite sheet
  const randomSpriteIndex = Math.floor(Math.random() * MOUNTAIN_SPRITES.length);
  const sprite = MOUNTAIN_SPRITES[randomSpriteIndex];

  // Select a random offset to position the sprite within the hexagon
  const randomOffsetIndex = Math.floor(Math.random() * MOUNTAIN_OFFSETS.length);
  const offset = MOUNTAIN_OFFSETS[randomOffsetIndex];

  return {
    spritesheet: "/images/terrain/mountains_sprites.png",
    x: sprite.x + offset.x,
    y: sprite.y + offset.y,
    width: sprite.width,
    height: sprite.height,
  };
};

// Define terrain types with colors and embedded sprite data
export const TERRAIN_TYPES = {
  grass: {
    type: "grass" as TerrainType,
    color: "#7EC850",
    backgroundImage: "/images/terrain/grass.png",
    spriteScale: 1.0,
  },
  mountain: {
    type: "mountain" as TerrainType,
    color: "#5a8c42", // Green with a more noticeable brown tint
    // The actual sprite will be randomly assigned per tile
    spriteScale: 1.0,
  },
  forest: {
    type: "forest" as TerrainType,
    color: "#4a9f4f",
    // The actual sprite will be randomly assigned per tile
    spriteScale: 1.0,
  },
  water: {
    type: "water" as TerrainType,
    color: "#5DA9E9",
    backgroundImage: "/images/terrain/water_tile.png",
    spriteScale: 1.0,
  },
};
