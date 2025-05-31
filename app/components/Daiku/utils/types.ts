// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
export type GridPosition = { q: number; r: number };

// Define terrain types and their colors
export type TerrainType = "grass" | "mountain" | "forest" | "water";

// Define a sprite from a sprite sheet
export interface SpriteSheetSprite {
  spritesheet: string; // Path to the sprite sheet
  x: number;           // X position in the sprite sheet
  y: number;           // Y position in the sprite sheet
  width: number;       // Width of the sprite
  height: number;      // Height of the sprite
  singleImage?: boolean; // Whether this is a single image (not part of a sprite sheet)
}

export interface TerrainDefinition {
  type: TerrainType;
  color: string;
  // Properties for sprite-based rendering
  sprite?: string;               // Path to a simple sprite image
  backgroundImage?: string;      // Path to a background image for the terrain
  spriteSheetSprite?: SpriteSheetSprite; // For sprites from a sprite sheet
  spriteScale?: number;          // Scale factor for the sprite (1.0 = original size)
}

// Define player entity types
export type PlayerUnitType = "archer" | "cavalry" | "infantry";

// Define enemy entity types
export type EnemyUnitType = "clobbin" | "spettle" | "skritcher" | "whumble";

// Combined entity type for general usage
export type EntityType = PlayerUnitType | EnemyUnitType;

export interface EntityDefinition {
  type: EntityType;
  color: string;
  movement: number;
  // Special abilities and characteristics
  abilities: {
    extraRangeInMountains?: boolean;
    poorRangeInForests?: boolean;
    canShootOverWater?: boolean;
    poorDefense?: boolean;
    poorInForests?: boolean;
    greatInGrass?: boolean;
    highDefense?: boolean;
    closeRangeBrawler?: boolean;
  };
}

// Player entity with position
export interface PlayerEntity {
  id: string;
  position: GridPosition;
  entityType: EntityDefinition;
  isEnemy?: false;
}

// Enemy entity with position
export interface EnemyEntity {
  id: string;
  position: GridPosition;
  entityType: EntityDefinition;
  isEnemy: true;
}

// Combined entity type
export type GameEntity = PlayerEntity | EnemyEntity;

// Hexagon with terrain data
export interface HexagonData extends GridPosition {
  terrain: TerrainDefinition;
  entity?: GameEntity; // Optional entity on this hexagon
}
