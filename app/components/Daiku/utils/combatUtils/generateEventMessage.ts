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
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Cavalry") {
      action = damage > 0 ? "charges at" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Mage") {
      action = damage > 0 ? "casts fireball at" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Infantry") {
      action = damage > 0 ? "attacks" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Clobbin") {
      action = damage > 0 ? "charges at" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Spettle") {
      action = damage > 0 ? "squirts at" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Skritcher") {
      action = damage > 0 ? "stratches at" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    if (attackerName === "Whumble") {
      action = damage > 0 ? "whumps on" : "misses";
      adverb = getRandomAdverb(damage > 0, attackerName);
      adjective = getRandomAdjective(damage > 0, attackerName);
    }

    return `The ${adjective} ${attackerName} ${adverb} ${action} ${targetName} for ${damage} damage! (${currentHealth} → ${newHealth})`;
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

  if (attackerName === "Infantry") {
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
        "poor",
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
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
        "short-sighted",
        "blind",
        "clumsy",
        "lazy",
        "sleepy"
      );
    }
  }

  if (attackerName === "Infantry") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "with talent"
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

  if (attackerName === "Clobbin") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "with talent"
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

  if (attackerName === "Spettle") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "with talent"
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

  if (attackerName === "Skritcher") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "with talent"
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

  if (attackerName === "Whumble") {
    if (success) {
      adverbs.push(
        "quickly",
        "precisely",
        "accurately",
        "skillfully",
        "expertly",
        "talented",
        "gifted",
        "with talent"
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

  return adverbs[Math.floor(Math.random() * adverbs.length)];
};

const getRandomAction = (success: boolean, attackerName: string) => {
  if (attackerName === "Archer") {
    return success ? "shoots" : "misses";
  }

  const actions = success
    ? ["attacks", "shoots", "casts fireball at"]
    : ["misses", "misses", "misses"];

  return actions[Math.floor(Math.random() * actions.length)];
};
