import { EnemyUnitType, PlayerUnitType } from "./types";

// Define entity types with their abilities and characteristics
export const playerUnitTypes = {
  archer: {
    type: "archer" as PlayerUnitType,
    color: "#FF5252", // Red
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 114, // Third sprite in first row (0-indexed)
      y: 0, // First row
      width: 64,
      height: 94,
      singleImage: false,
    },
    movement: 2, // 2 tiles per turn
    abilities: {
      extraRangeInMountains: true,
      poorRangeInForests: true,
      canShootOverWater: true,
      poorDefense: true,
    },
  },
  cavalry: {
    type: "cavalry" as PlayerUnitType,
    color: "#448AFF", // Blue
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 54, // Second sprite in first row (0-indexed)
      y: 0,
      width: 64,
      height: 94,
      singleImage: false,
    },
    movement: 3, // 3 tiles per turn
    abilities: {
      poorInForests: true,
      greatInGrass: true,
    },
  },
  infantry: {
    type: "infantry" as PlayerUnitType,
    color: "#66BB6A", // Green
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 0,
      y: 0,
      width: 64,
      height: 94,
      singleImage: false,
    },
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
  mage: {
    type: "mage" as PlayerUnitType,
    color: "#448AFF", // Blue
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 164,
      y: 0,
      width: 64,
      height: 94,
      singleImage: false,
    },
    movement: 3, // 3 tiles per turn
    abilities: {
      poorDefense: true,
      canCastFireball: true,
      canCastHealing: true,
    },
  },
};

export const enemyUnitTypes = {
  clobbin: {
    type: "clobbin" as EnemyUnitType,
    color: "#FF9800", // Orange
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 0, // First sprite in bottom half
      y: 114, // Second row
      width: 64,
      height: 64,
      singleImage: false,
    },
    movement: 2, // 2 tiles per turn
    abilities: {
      extraRangeInMountains: true,
      poorRangeInForests: true,
      canShootOverWater: true,
      poorDefense: true,
    },
  },
  spuddle: {
    type: "spuddle" as EnemyUnitType,
    color: "#FFC107", // Yellow
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 54, // Second sprite in second row
      y: 114, // Second row
      width: 64,
      height: 64,
      singleImage: false,
    },
    movement: 0, // Does not move, only in water tiles
    abilities: {
      waterOnly: true,
    },
  },
  skritcher: {
    type: "skritcher" as EnemyUnitType,
    color: "#E91E63", // Magenta
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 110, // Third sprite in second row
      y: 114, // Second row
      width: 64,
      height: 64,
      singleImage: false,
    },
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
  whumble: {
    type: "whumble" as EnemyUnitType,
    color: "#9C27B0", // Purple
    spriteSheetSprite: {
      spritesheet: "/images/entities/entity_sprites_v1.png",
      x: 164, // Fourth sprite in second row
      y: 124, // Second row
      width: 64,
      height: 64,
      singleImage: false,
    },
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
};
