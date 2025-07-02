import { GameEntity, TerrainType } from "../types";

export const generateEventMessage = (
  attacker: GameEntity,
  target: GameEntity,
  damage: number,
  currentHealth: number,
  newHealth: number,
  targetTerrainType?: TerrainType
) => {
  // Generate terrain advantage/disadvantage text based on unit type and terrain
  const getTerrainEffectText = () => {
    if (!targetTerrainType) return "";

    const unitType = attacker.entityType.type;

    // Check for terrain advantages/disadvantages
    if (targetTerrainType === "water") {
      if (unitType === "cavalry" && damage === 0) {
        return ` [Disadvantage: Cavalry can't attack across water]`;
      }
      if (unitType === "mage") {
        return ` [Disadvantage: Mage power reduced on water]`;
      }
    }

    if (targetTerrainType === "forest") {
      if (attacker.entityType.abilities?.poorAttackInForests) {
        return ` [Disadvantage: Poor attack in forests]`;
      }
      if (attacker.entityType.abilities?.greatAttackInForests) {
        return ` [Advantage: Great attack in forests]`;
      }
    }

    if (targetTerrainType === "mountain") {
      if (attacker.entityType.abilities?.poorAttackInMountains) {
        return ` [Disadvantage: Poor attack in mountains]`;
      }
      if (attacker.entityType.abilities?.greatAttackInMountains) {
        return ` [Advantage: Great attack in mountains]`;
      }
    }

    if (targetTerrainType === "grass") {
      if (attacker.entityType.abilities?.greatAttackInGrass) {
        return ` [Advantage: Great attack in grass]`;
      }
    }

    return "";
  };

  const terrainEffect = getTerrainEffectText();

  if (attacker.isEnemy) {
    return `${attacker.entityType.name} attacks ${target.entityType.name} for ${damage} damage. (${currentHealth} → ${newHealth})${terrainEffect}`;
  } else {
    const attackerName = attacker.entityType.name;
    const targetName = target.entityType.name;
    let action = "attacks";
    let adverb = "swiftly";
    let adjective = "brave";

    if (attackerName === "Archer") {
      action = damage > 0 ? "shoots" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Cavalry") {
      action = damage > 0 ? "charges at" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Mage") {
      action = damage > 0 ? "casts fireball at" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Warrior") {
      action = damage > 0 ? "attacks" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Clobbin") {
      action = damage > 0 ? "charges at" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Spuddle") {
      action = damage > 0 ? "squirts at" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Skritcher") {
      action = damage > 0 ? "stratches at" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Whumble") {
      action = damage > 0 ? "whumps on" : "misses";
      // adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }
    console.log("not useing the adjective ", adjective, " for now.");

    return `${attackerName} ${action} ${targetName} for ${damage} damage. (${currentHealth} → ${newHealth})${terrainEffect}`;
  }
};

const getRandomAdjective = (success: boolean, attackerName: string) => {
  const adjectives = success ? ["brave", "strong", "smart"] : ["weak", "stupid", "inept"];

  if (attackerName === "Archer") {
    if (success) {
      adjectives.push(
        "sharp",
        "cunning",
        "quick",
        "precise",
        "accurate",
        "skillful",
        "expert",
        "talented",
        "gifted",
        "talented"
      );
    } else {
      adjectives.push(
        "weak",
        "stupid",
        "inept",
        "poor",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Cavalry") {
    if (success) {
      adjectives.push(
        "thunderous",
        "powerful",
        "strong",
        "brave",
        "quick",
        "swift",
        "bold",
        "courageous",
        "daring",
        "galant"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "loathed",
        "disliked",
        "disgusted",
        "hated",
        "detested",
        "abhorred"
      );
    }
  }

  if (attackerName === "Mage") {
    if (success) {
      adjectives.push(
        "magical",
        "wise",
        "clever",
        "skillful",
        "expert",
        "talented",
        "gifted",
        "unprecedented",
        "unmatched",
        "unparalleled",
        "unparalleled",
        "whimsical"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Warrior") {
    if (success) {
      adjectives.push(
        "brave",
        "strong",
        "quick",
        "swift",
        "bold",
        "courageous",
        "daring",
        "galant"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Clobbin") {
    if (success) {
      adjectives.push(
        "scary",
        "strong",
        "intimidating",
        "scouring",
        "ferocious",
        "bold",
        "cruel",
        "brutal",
        "ferocious"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Spettle") {
    if (success) {
      adjectives.push(
        "scary",
        "strong",
        "intimidating",
        "scouring",
        "ferocious",
        "bold",
        "cruel",
        "brutal",
        "ferocious"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Skritcher") {
    if (success) {
      adjectives.push(
        "scary",
        "strong",
        "intimidating",
        "scouring",
        "ferocious",
        "bold",
        "cruel",
        "brutal",
        "ferocious"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Whumble") {
    if (success) {
      adjectives.push(
        "scary",
        "strong",
        "intimidating",
        "scouring",
        "ferocious",
        "bold",
        "cruel",
        "brutal",
        "ferocious"
      );
    } else {
      adjectives.push(
        "lost",
        "stupid",
        "inept",
        "inconsistent",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  return adjectives[Math.floor(Math.random() * adjectives.length)];
};

const getRandomAdverb = (success: boolean, attackerName: string) => {
  const adverbs = success ? ["swiftly", "bravely", "wisely"] : ["poorly", "weakly", "stupidly"];

  if (attackerName === "Archer") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "talented"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poor",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Cavalry") {
    if (success) {
      adverbs.push("quickly", "precisely", "accurately", "skillfully", "expertly", "with talent");
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Mage") {
    if (success) {
      adverbs.push("quickly", "precisely", "accurately", "skillfully", "expertly", "with talent");
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poor",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Warrior") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talentedly",
        "giftedly",
        "with great aplomb and skill,"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poorly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Clobbin") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talentedly",
        "giftedly",
        "with talent"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poorly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Spettle") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talentedly",
        "giftedly",
        "with talent"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poorly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Skritcher") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talentedly",
        "giftedly",
        "with talent"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poorly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  if (attackerName === "Whumble") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talentedly",
        "giftedly",
        "with talent"
      );
    } else {
      adverbs.push(
        "poorly",
        "weakly",
        "stupidly",
        "poorly",
        "short-sightedly",
        "blindly",
        "clumsily",
        "lazily",
        "sleepily"
      );
    }
  }

  return adverbs[Math.floor(Math.random() * adverbs.length)];
};
