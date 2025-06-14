import { calculateHexDistance, DEFENSE_MULTIPLIER } from ".";
import { GridPosition, EntityDefinition, TerrainType } from "../types";

export type TerrainEffect = {
  type: 'advantage' | 'disadvantage' | 'neutral';
  description: string;
};

export type AttackResult = {
  damage: number;
  terrainEffect: TerrainEffect | null;
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
  targetTerrainType: TerrainType,
  targetDefense: number
): AttackResult => {
  // Start with the base power from combat stats
  let damage = attacker.combat.power;
  // Get the distance to target
  const distance = calculateHexDistance(attackerPos, targetPos);

  // Get the range of the attacker
  const range = attacker.combat.distance;
  
  // Track terrain effects
  let terrainEffect: TerrainEffect | null = null;

  console.log("---------");
  console.log("Calcluating damage for", attacker.type);
  console.log("distance from target", distance);
  console.log("base damage", damage);
  console.log("attacker range", range);

  // Apply terrain modifiers
  // If the target terrain is water
  // Cavalry can only attack if 1 hex away
  // Mage attack is lowered to 1 because fireballs and water don't mix
  if (targetTerrainType === "water") {
    if (attacker.type === "cavalry" && distance > 1) {
      console.log("cavalry cannot attack from distance", distance, "damage", damage, "->", 0);
      damage = 0;
      terrainEffect = {
        type: 'disadvantage',
        description: "Cavalry can't attack across water"
      };
    } else if (attacker.type === "mage") {
      console.log("mage cannot attack from distance", distance, "damage", damage, "->", 1);
      damage = 1;
      terrainEffect = {
        type: 'disadvantage',
        description: "Mage power reduced on water"
      };
    }
  }

  // If the target terrain is forest
  // Units with poor attack in forests have damage lowered by 1
  // Units with great attack in forests have damage increased by 1
  // Units with great range in mountains have distance penalty halved
  if (targetTerrainType === "forest") {
    if (attacker.abilities.poorAttackInForests) {
      console.log("poor attack in forests, damage", damage, "->", damage - 1);
      damage -= 1;
      terrainEffect = {
        type: 'disadvantage',
        description: "Poor attack in forests"
      };
    }
    if (attacker.abilities.greatAttackInForests) {
      console.log("great attack in forests, damage", damage, "->", damage + 1);
      damage += 1;
      terrainEffect = {
        type: 'advantage',
        description: "Great attack in forests"
      };
    }
  }

  // If the target terrain is mountain
  // Units with poor attack in mountains have damage lowered by 1
  if (targetTerrainType === "mountain") {
    if (attacker.abilities.poorAttackInMountains) {
      console.log("poor attack in mountains, damage", damage, "->", damage - 1);
      damage -= 1;
      terrainEffect = {
        type: 'disadvantage',
        description: "Poor attack in mountains"
      };
    }

    if (attacker.abilities.greatAttackInMountains) {
      console.log("great attack in mountains, damage", damage, "->", damage + 1);
      damage += 1;
      terrainEffect = {
        type: 'advantage',
        description: "Great attack in mountains"
      };
    }
  }

  // If the target terrain is grass
  // Units with great attack in grass have damage increased by 1
  if (targetTerrainType === "grass") {
    if (attacker.abilities.greatAttackInGrass) {
      console.log("great attack in grass, damage", damage, "->", damage + 1);
      damage += 1;
      terrainEffect = {
        type: 'advantage',
        description: "Great attack in grass"
      };
    }
  }

  // Apply distance modifiers
  // If cavalry is attacking from a distance, damage is reduced by 1
  if (attacker.type === "cavalry" && distance > 1) {
    console.log(
      "cavalry cannot attack from distance",
      distance,
      "damage",
      damage,
      "->",
      damage - 1
    );
    damage -= 1;
  }

  // The archers damage is reduced by 1 for each additional tile away
  if (attacker.type === "archer" && distance > 1) {
    damage -= distance - 1;
    console.log("archer damage reduced to", damage, "due to distance:", distance);
  }

  // Apply defense modifiers
  damage = Math.floor(damage - targetDefense * DEFENSE_MULTIPLIER);
  console.log("damage decreased to", damage, "due to defense:", targetDefense);

  console.log("final damage", damage);
  return {
    damage: damage > 0 ? damage : 0,
    terrainEffect
  };
};
