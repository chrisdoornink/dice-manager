import { EnemyUnitType, PlayerUnitType } from "./types";

// Define entity types with their abilities and characteristics
export const playerUnitTypes = {
  archer: {
    name: "Archer",
    type: "archer" as PlayerUnitType,
    color: "#FF5252", // Red
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 170, // Third sprite in first row (0-indexed)
      y: 10, // First row
      width: 60,
      height: 104,
      singleImage: false,
    },
    movement: 2, // 2 tiles per turn
    combat: {
      power: 4, // High attack power (when close)
      distance: 3, // High range
      defense: 1, // Low defense
      agility: 2, // Medium agility
    },
    minHealth: 1,
    maxHealth: 3,
    abilities: {
      greatRangeInMountains: true,
      canShootOverWater: true,
      poorRangeInForests: true,
    },
  },
  cavalry: {
    name: "Cavalry",
    type: "cavalry" as PlayerUnitType,
    color: "#448AFF", // Blue
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 77, // Second sprite in first row (0-indexed)
      y: 10,
      width: 93,
      height: 104,
      singleImage: false,
    },
    movement: 3, // 3 tiles per turn
    combat: {
      power: 2, // Medium attack power
      distance: 2, // Medium range
      defense: 2, // Medium defense
      agility: 3, // High agility
    },
    minHealth: 2,
    maxHealth: 4,
    abilities: {
      poorAttackInForests: true,
      greatAttackInGrass: true,
      poorAttackInMountains: true,
      poorMovementInForests: true,
    },
  },
  infantry: {
    name: "Infantry",
    type: "infantry" as PlayerUnitType,
    color: "#66BB6A", // Green
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 0,
      y: 10,
      width: 78,
      height: 104,
      singleImage: false,
    },
    movement: 1, // 1 tiles per turn
    combat: {
      power: 3, // High attack power
      distance: 1, // Low range
      defense: 3, // High defense
      agility: 1, // Low agility
    },
    minHealth: 3,
    maxHealth: 5,
    abilities: {
      greatAttackInForests: true,
      poorAttackInMountains: true,
      poorMovementInMountains: true,
    },
  },
  mage: {
    name: "Mage",
    type: "mage" as PlayerUnitType,
    color: "#448AFF", // Blue
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 230,
      y: 10,
      width: 78,
      height: 104,
      singleImage: false,
    },
    movement: 3, // 3 tiles per turn
    combat: {
      power: 3, // High attack power
      distance: 4, // Highest range
      defense: 1, // Low defense
      agility: 2, // Medium agility
    },
    minHealth: 1,
    maxHealth: 2,
    abilities: {
      canCastHealing: true,
      greatAttackInMountains: true,
      poorAttackInForests: true,
      canShootOverWater: true,
    },
  },
};

export const enemyUnitTypes = {
  clobbin: {
    name: "Clobbin",
    type: "clobbin" as EnemyUnitType,
    color: "#FF9800", // Orange
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 0, // First sprite in bottom half
      y: 120, // Second row
      width: 94,
      height: 108,
      singleImage: false,
    },
    movement: 2, // 2 tiles per turn
    combat: {
      power: 2, // Medium attack power
      distance: 2, // Medium range
      defense: 2, // Medium defense
      agility: 2, // Medium agility
    },
    minHealth: 2,
    maxHealth: 4,
    abilities: {
      extraRangeInMountains: true,
      poorRangeInForests: true,
      canShootOverWater: true,
    },
  },
  spuddle: {
    name: "Spuddle",
    type: "spuddle" as EnemyUnitType,
    color: "#FFC107", // Yellow
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 90, // Second sprite in second row
      y: 120, // Second row
      width: 64,
      height: 108,
      singleImage: false,
    },
    movement: 0, // Does not move, only in water tiles
    combat: {
      power: 1, // Low attack power
      distance: 2, // Medium range
      defense: 1, // Low defense
      agility: 1, // Low agility
    },
    minHealth: 1,
    maxHealth: 3,
    abilities: {
      waterOnly: true,
    },
  },
  skritcher: {
    name: "Skritcher",
    type: "skritcher" as EnemyUnitType,
    color: "#E91E63", // Magenta
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 155, // Third sprite in second row
      y: 134, // Second row
      width: 64,
      height: 128,
      singleImage: false,
    },
    movement: 1, // 1 tile per turn
    combat: {
      power: 2, // Medium attack power
      distance: 1, // Low range
      defense: 3, // High defense
      agility: 1, // Low agility
    },
    minHealth: 2,
    maxHealth: 4,
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
  whumble: {
    name: "Whumble",
    type: "whumble" as EnemyUnitType,
    color: "#9C27B0", // Purple
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 230, // Fourth sprite in second row
      y: 130, // Second row
      width: 94,
      height: 108,
      singleImage: false,
    },
    movement: 1, // 1 tile per turn
    combat: {
      power: 3, // High attack power
      distance: 1, // Low range
      defense: 3, // High defense
      agility: 1, // Low agility
    },
    minHealth: 3,
    maxHealth: 5,
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
};
