import { EntityDefinition, GridPosition } from "../types";

export const DEFENSE_MULTIPLIER = 0.3;

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

  // Use the distance property from the combat object
  return distance <= attacker.combat.distance;
};
