// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
export type GridPosition = { q: number; r: number };

// Define terrain types and their colors
export type TerrainType = "grass" | "mountain" | "forest" | "water";

// Define a sprite from a sprite sheet
export interface SpriteSheetSprite {
  spritesheet: string; // Path to the sprite sheet
  x: number; // X position in the sprite sheet
  y: number; // Y position in the sprite sheet
  width: number; // Width of the sprite
  height: number; // Height of the sprite
  singleImage?: boolean; // Whether this is a single image (not part of a sprite sheet)
}

export interface TerrainDefinition {
  type: TerrainType;
  color: string;
  // Properties for sprite-based rendering
  sprite?: string; // Path to a simple sprite image
  backgroundImage?: string; // Path to a background image for the terrain
  spriteSheetSprite?: SpriteSheetSprite; // For sprites from a sprite sheet
  spriteScale?: number; // Scale factor for the sprite (1.0 = original size)
  patternOpacity?: number; // Opacity of the background pattern (0.0 to 1.0)
}

// Define player entity types
export type PlayerUnitType = "archer" | "cavalry" | "infantry" | "mage";

// Define enemy entity types
export type EnemyUnitType = "clobbin" | "spuddle" | "skritcher" | "whumble";

// Combined entity type for general usage
export type EntityType = PlayerUnitType | EnemyUnitType;

export interface EntityDefinition {
  name: string;
  type: EntityType;
  color: string;
  sprite?: string; // Path to entity sprite image
  spriteSheetSprite?: SpriteSheetSprite;
  movement: number;
  // Combat attributes
  combat: {
    power: number; // Attack strength
    distance: number; // Attack range in hexes
    defense: number; // Defensive capabilities
    agility: number; // Evasion/mobility aspects
  };
  // Health attributes
  minHealth: number;
  maxHealth: number;
  currentHealth?: number; // Optional current health, defaults to maxHealth if not set
  // Special abilities and characteristics
  abilities: {
    greatRangeInMountains?: boolean;
    greatRangeInForests?: boolean;
    poorRangeInForests?: boolean;
    greatRangeInGrass?: boolean;
    canShootOverWater?: boolean;
    poorAttackInForests?: boolean;
    greatAttackInForests?: boolean;
    poorAttackInGrass?: boolean;
    greatAttackInGrass?: boolean;
    poorAttackInMountains?: boolean;
    greatAttackInMountains?: boolean;
    poorAttackInWater?: boolean;
    greatAttackInWater?: boolean;
    waterOnly?: boolean; // For entities that can only exist on water tiles
    canCastHealing?: boolean;
    poorMovementInForests?: boolean;
    greatMovementInForests?: boolean;
    poorMovementInMountains?: boolean;
    greatMovementInMountains?: boolean;
    poorMovementInWater?: boolean;
    greatMovementInWater?: boolean;
  };
}

// Player entity with position
export interface PlayerEntity {
  id: string;
  position: GridPosition;
  entityType: EntityDefinition;
  isEnemy?: boolean;
  defeated?: boolean;
}

// Enemy entity with position
export interface EnemyEntity extends PlayerEntity {}

// Combined entity type
export type GameEntity = PlayerEntity | EnemyEntity;

// Hexagon with terrain data
export interface HexagonData extends GridPosition {
  terrain: TerrainDefinition;
  entity?: GameEntity; // Optional entity on this hexagon
}
