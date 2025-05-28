import { enemyUnitType, PlayerUnitType } from "./types";

// Define entity types with their abilities and characteristics
export const playerUnitTypes = {
  archer: {
    type: "archer" as PlayerUnitType,
    color: "#FF5252", // Red
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
    movement: 3, // 3 tiles per turn
    abilities: {
      poorInForests: true,
      greatInGrass: true,
    },
  },
  infantry: {
    type: "infantry" as PlayerUnitType,
    color: "#66BB6A", // Green
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
};

export const enemyUnitTypes = {
  clobbin: {
    type: "clobbin" as enemyUnitType,
    color: "#FF9800", // Orange
    movement: 2, // 2 tiles per turn
    abilities: {
      extraRangeInMountains: true,
      poorRangeInForests: true,
      canShootOverWater: true,
      poorDefense: true,
    },
  },
  spettle: {
    type: "spettle" as enemyUnitType,
    color: "#FFC107", // Yellow
    movement: 3, // 3 tiles per turn
    abilities: {
      poorInForests: true,
      greatInGrass: true,
    },
  },
  skritcher: {
    type: "skritcher" as enemyUnitType,
    color: "#E91E63", // Magenta
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
  whumble: {
    type: "whumble" as enemyUnitType,
    color: "#9C27B0", // Purple
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
};
