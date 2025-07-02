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
      power: 2, // High attack power (when close)
      distance: 2, // High range
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
  warrior: {
    name: "Warrior",
    type: "warrior" as PlayerUnitType,
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
      power: 2, // High attack power
      distance: 3, // Highest range
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
  // standard sword goblin guy
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
    behavior: {
      default: [
        { key: "aggressive", value: 5 },
        { key: "defensive", value: 1 },
        { key: "flanking", value: 2 },
        { key: "random", value: 1 },
        { key: "stationary", value: 1 },
      ],
      inGroup: [
        { key: "aggressive", value: 2 },
        { key: "defensive", value: 1 },
        { key: "flanking", value: 3 },
        { key: "random", value: 1 },
        { key: "stationary", value: 2 },
      ],
      alone: [
        { key: "aggressive", value: 1 },
        { key: "defensive", value: 3 },
        { key: "flanking", value: 3 },
        { key: "random", value: 1 },
        { key: "stationary", value: 3 },
      ],
    },
  },
  // no sword just shield
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
    movement: 2,
    combat: {
      power: 3, // High attack power
      distance: 1, // Low range
      defense: 3, // High defense
      agility: 1, // Low agility
    },
    minHealth: 3,
    maxHealth: 6,
    abilities: {
      greatDefenseInForests: true,
    },
    behavior: {
      default: [
        { key: "aggressive", value: 1 },
        { key: "defensive", value: 3 },
        { key: "flanking", value: 3 },
        { key: "random", value: 1 },
        { key: "stationary", value: 3 },
      ],
      inGroup: [
        { key: "aggressive", value: 4 },
        { key: "defensive", value: 2 },
        { key: "flanking", value: 2 },
        { key: "random", value: 0 },
        { key: "stationary", value: 2 },
      ],
      alone: [
        { key: "aggressive", value: 4 },
        { key: "defensive", value: 2 },
        { key: "flanking", value: 2 },
        { key: "random", value: 1 },
        { key: "stationary", value: 2 },
      ],
    },
  },
  // groundhog looking thing
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
      power: 1, // Medium attack power
      distance: 4, // High range
      defense: 1, // High defense
      agility: 2, // Low agility
    },
    minHealth: 2,
    maxHealth: 4,
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
    behavior: {
      default: [
        { key: "aggressive", value: 0 },
        { key: "defensive", value: 3 },
        { key: "flanking", value: 0 },
        { key: "random", value: 1 },
        { key: "stationary", value: 7 },
      ],
      inGroup: [
        { key: "aggressive", value: 1 },
        { key: "defensive", value: 1 },
        { key: "flanking", value: 0 },
        { key: "random", value: 2 },
        { key: "stationary", value: 5 },
      ],
      alone: [
        { key: "aggressive", value: 4 },
        { key: "defensive", value: 4 },
        { key: "flanking", value: 0 },
        { key: "random", value: 2 },
        { key: "stationary", value: 1 },
      ],
    },
  },
  // snail looking thing
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
    minHealth: 1,
    maxHealth: 3,
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
    behavior: {
      default: [
        { key: "aggressive", value: 0 },
        { key: "defensive", value: 3 },
        { key: "flanking", value: 2 },
        { key: "random", value: 1 },
        { key: "stationary", value: 4 },
      ],
      inGroup: [
        { key: "aggressive", value: 5 },
        { key: "defensive", value: 1 },
        { key: "flanking", value: 1 },
        { key: "random", value: 2 },
        { key: "stationary", value: 2 },
      ],
      alone: [
        { key: "aggressive", value: 1 },
        { key: "defensive", value: 4 },
        { key: "flanking", value: 1 },
        { key: "random", value: 1 },
        { key: "stationary", value: 4 },
      ],
    },
  },
};
