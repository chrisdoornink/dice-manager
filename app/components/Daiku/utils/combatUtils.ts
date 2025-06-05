import { GridPosition, EntityDefinition, TerrainType } from "./types";

/**
 * Calculate the distance between two grid positions in a hex grid
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Number of hexes distance
 */
export const calculateHexDistance = (pos1: GridPosition, pos2: GridPosition): number => {
  // Using the axial coordinate system, distance is calculated as:
  // max(abs(q1-q2), abs(r1-r2), abs(q1+r1-q2-r2))
  return Math.max(
    Math.abs(pos1.q - pos2.q),
    Math.abs(pos1.r - pos2.r),
    Math.abs(pos1.q + pos1.r - pos2.q - pos2.r)
  );
};

/**
 * Calculate attack damage based on attacker, target position, and terrain
 * @param attacker The attacking entity
 * @param attackerPos Position of the attacker
 * @param targetPos Position of the target
 * @param targetTerrainType Terrain type where the target is located
 * @returns Calculated attack damage (minimum 0)
 */
export const calculateAttackDamage = (
  attacker: EntityDefinition,
  attackerPos: GridPosition,
  targetPos: GridPosition,
  targetTerrainType: TerrainType
): number => {
  // For regular units, use their base attack value
  if (attacker.type !== "mage") {
    return attacker.attack;
  }
  
  // Special calculation for mage
  let damage = attacker.attack; // Base attack is 3
  
  // Apply terrain modifier
  if (targetTerrainType === "water" || targetTerrainType === "forest") {
    damage -= 2; // Loses 2 points in water or forest
  }
  
  // Apply distance modifier
  const distance = calculateHexDistance(attackerPos, targetPos);
  if (distance > 1) {
    damage -= (distance - 1); // Loses 1 point for each hex beyond 1
  }
  
  // Ensure damage is not negative
  return Math.max(0, damage);
};

/**
 * Check if a target is within attack range
 * @param attacker The attacking entity
 * @param attackerPos Position of the attacker
 * @param targetPos Position of the target
 * @returns Boolean indicating if target is within attack range
 */
export const isTargetInRange = (
  attacker: EntityDefinition,
  attackerPos: GridPosition,
  targetPos: GridPosition
): boolean => {
  const distance = calculateHexDistance(attackerPos, targetPos);
  
  // Different units have different attack ranges
  switch (attacker.type) {
    case "archer":
      return distance <= 3; // Archers can attack up to 3 tiles away
    case "mage":
      return distance <= 4; // Mages can attack up to 4 tiles away
    case "cavalry":
      return distance <= 2; // Cavalry can attack up to 2 tiles away
    case "infantry":
    default:
      return distance <= 1; // Infantry and others can only attack adjacent tiles
  }
};
