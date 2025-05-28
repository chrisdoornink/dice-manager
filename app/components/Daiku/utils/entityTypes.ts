import { EntityType } from "./types";

// Define entity types with their abilities and characteristics
export const entityTypes = {
  archer: {
    type: "archer" as EntityType,
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
    type: "cavalry" as EntityType,
    color: "#448AFF", // Blue
    movement: 3, // 3 tiles per turn
    abilities: {
      poorInForests: true,
      greatInGrass: true,
    },
  },
  infantry: {
    type: "infantry" as EntityType,
    color: "#66BB6A", // Green
    movement: 1, // 1 tile per turn
    abilities: {
      highDefense: true,
      closeRangeBrawler: true,
    },
  },
};
