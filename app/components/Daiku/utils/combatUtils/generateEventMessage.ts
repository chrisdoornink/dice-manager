import { GameEntity } from "../types";

export const generateEventMessage = (
  attacker: GameEntity,
  target: GameEntity,
  damage: number,
  currentHealth: number,
  newHealth: number
) => {
  if (attacker.isEnemy) {
    return `${attacker.entityType.name} attacks ${target.entityType.name} for ${damage} damage! (${currentHealth} → ${newHealth})`;
  } else {
    const attackerName = attacker.entityType.name;
    const targetName = target.entityType.name;
    let action = "attacks";
    let adverb = "swiftly";
    let adjective = "brave";

    if (attackerName === "Archer") {
      action = damage > 0 ? "shoots" : "misses";
      adverb = damage > 0 ? "quickly" : "poorly";
      adjective = damage > 0 ? "sharp" : "near-sighted";
    }

    if (attackerName === "Cavalry") {
      action = damage > 0 ? "charges" : "misses";
      adverb = damage > 0 ? "powerfully" : "poorly";
      adjective = damage > 0 ? "strong" : "weak";
    }

    if (attackerName === "Mage") {
      action = damage > 0 ? "casts fireball at" : "misses";
      adverb = damage > 0 ? "wisely" : "poorly";
      adjective = damage > 0 ? "smart" : "stupid";
    }

    if (attackerName === "Infantry") {
      action = damage > 0 ? "attacks" : "misses";
      adverb = damage > 0 ? "bravely" : "poorly";
      adjective = damage > 0 ? "strong" : "weak";
    }

    if (attackerName === "Clobbin") {
      action = damage > 0 ? "charges" : "misses";
      adverb = damage > 0 ? "powerfully" : "poorly";
      adjective = damage > 0 ? "strong" : "weak";
    }

    if (attackerName === "Spettle") {
      action = damage > 0 ? "squirts at" : "misses";
      adverb = damage > 0 ? "quickly" : "poorly";
      adjective = damage > 0 ? "sharp" : "near-sighted";
    }

    if (attackerName === "Skritcher") {
      action = damage > 0 ? "stratches at" : "misses";
      adverb = damage > 0 ? "creepily" : "pathetically";
      adjective = damage > 0 ? "gross" : "stupid";
    }

    if (attackerName === "Whumble") {
      action = damage > 0 ? "whumps on" : "misses";
      adverb = damage > 0 ? "powerfully" : "poorly";
      adjective = damage > 0 ? "gross" : "stupid";
    }

    return `The ${adjective} ${attackerName} ${adverb} ${action} ${targetName} for ${damage} damage! (${currentHealth} → ${newHealth})`;
  }
};
