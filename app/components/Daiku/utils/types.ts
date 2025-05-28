// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
export type GridPosition = { q: number; r: number };

// Define terrain types and their colors
export type TerrainType = "grass" | "mountain" | "forest" | "water";

export interface TerrainDefinition {
  type: TerrainType;
  color: string;
}

// Define player entity types
export type EntityType = "archer" | "cavalry" | "infantry";

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
}

// Hexagon with terrain data
export interface HexagonData extends GridPosition {
  terrain: TerrainDefinition;
  entity?: PlayerEntity; // Optional entity on this hexagon
}
