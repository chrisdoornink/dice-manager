import { calculateHexDistance } from ".";
import { calculateAttackDamage } from "./calculateAttackDamage";
import { generateEventMessage } from "./generateEventMessage";
import { EnemyEntity, PlayerEntity, TerrainDefinition } from "../types";

/**
 * Executes the combat phase between player and enemy entities
 * Determines attacks based on adjacency and returns updated entities with combat damage applied
 * @param enemyEntities List of enemy entities
 * @param playerEntities List of player entities
 * @param terrainMap Map of terrain types by position key
 * @param combatResultCallback Function called after combat resolution with updated entities and results
 * @param logEvent Optional function to log events
 * @param roundNumber Optional round number for logging
 */
export const executeCombat = (
  enemyEntities: EnemyEntity[],
  playerEntities: PlayerEntity[],
  terrainMap: Map<string, TerrainDefinition>,
  combatResultCallback: (enemies: EnemyEntity[], players: PlayerEntity[]) => void,
  logEvent?: (message: string) => void,
  roundNumber?: number
) => {
  // Use optional logEvent function if provided
  const log = (message: string) => {
    if (logEvent) {
      logEvent(message);
    }
  };

  // Track which enemies are attacked by which players
  const playerAttacks = new Map<string, string>();
  // Track which players are attacked by which enemies
  const enemyAttacks = new Map<string, string>();

  // Determine which enemies each player attacks (closest enemy)
  playerEntities.forEach((player) => {
    // Ensure player is valid with an id and not defeated
    if (!player || !player.id || typeof player.id !== "string" || player.defeated) return;

    console.log("Player", player.id, "is not defeated and searching for the closest enemy");

    let closestEnemy: EnemyEntity | undefined;
    let minDistance = 10;

    // Check all enemy entities to find the closest one
    enemyEntities.forEach((enemy) => {
      // Skip if enemy is invalid, missing position, or defeated
      if (!enemy || !enemy.position || enemy.defeated) return;

      const distance = calculateHexDistance(player.position, enemy.position);
      console.log("Enemy", enemy.id, "is ", distance, "hexes away");
      if (distance < minDistance) {
        console.log("This is the closest enemy so far");
        minDistance = distance;
        if (closestEnemy) {
          console.log("Closest enemy was", closestEnemy.id);
        }
        closestEnemy = enemy;
      }
    });

    const playerCurrentCombatRange = () => {
      let attackRange = player.entityType.combat.distance;
      const terrainType = terrainMap.get(`${player.position.q},${player.position.r}`)?.type;
      if (terrainType === "forest" && player.entityType.abilities.poorRangeInForests) {
        attackRange -= 1;
      }
      if (terrainType === "forest" && player.entityType.abilities.greatRangeInForests) {
        attackRange += 1;
      }
      if (terrainType === "mountain" && player.entityType.abilities.greatRangeInMountains) {
        attackRange += 2;
      }
      if (terrainType === "grass" && player.entityType.abilities.greatRangeInGrass) {
        attackRange += 1;
      }
      return attackRange;
    };

    console.log("attack range for player", player.id, "is", playerCurrentCombatRange());

    // Track player attack if they're adjacent to an enemy
    if (
      closestEnemy &&
      minDistance <= playerCurrentCombatRange() &&
      "id" in closestEnemy &&
      closestEnemy.id
    ) {
      console.log("Player", player.id, "attacks enemy", closestEnemy.id);
      playerAttacks.set(player.id, closestEnemy.id);

      console.log("Player attacks", playerAttacks);
    }
  });

  // Determine which players each enemy attacks (closest player)
  enemyEntities.forEach((enemy) => {
    // Ensure enemy is valid with an id and not defeated
    if (!enemy || !enemy.id || typeof enemy.id !== "string" || enemy.defeated) return;

    let closestPlayer: PlayerEntity | undefined;
    let minDistance = 10;

    // Check all player entities to find the closest one
    playerEntities.forEach((player) => {
      // Skip if player is invalid, missing position, or defeated
      if (!player || !player.position || player.defeated) return;

      const distance = calculateHexDistance(enemy.position, player.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    });

    // Calculate enemy combat range with terrain bonuses (similar to player logic)
    const enemyCurrentCombatRange = () => {
      let attackRange = enemy.entityType.combat.distance;
      const terrainType = terrainMap.get(`${enemy.position.q},${enemy.position.r}`)?.type;
      
      if (terrainType === "forest" && enemy.entityType.abilities.poorRangeInForests) {
        attackRange -= 1;
      }
      if (terrainType === "forest" && enemy.entityType.abilities.greatRangeInForests) {
        attackRange += 1;
      }
      if (terrainType === "mountain" && enemy.entityType.abilities.greatRangeInMountains) {
        attackRange += 2;
      }
      if (terrainType === "grass" && enemy.entityType.abilities.greatRangeInGrass) {
        attackRange += 1;
      }
      return Math.max(1, attackRange); // Ensure minimum range of 1
    };

    // Track enemy attack if they're within their combat range of a player
    if (closestPlayer && minDistance <= enemyCurrentCombatRange() && "id" in closestPlayer && closestPlayer.id) {
      enemyAttacks.set(enemy.id, closestPlayer.id);
    }
  });

  // Apply combat damage after a delay
  setTimeout(() => {
    // Apply damage from player attacks
    const updatedEnemyEntities = enemyEntities.map((enemy) => {
      // Skip invalid or already defeated enemies
      if (!enemy || !("id" in enemy) || !enemy.id || enemy.defeated) return enemy;

      // Find ALL players who attacked this enemy
      const attackEntries = Array.from(playerAttacks.entries()).filter(
        (entry) => entry[1] === enemy.id
      );

      // If this enemy wasn't attacked by any player, return it unchanged
      if (attackEntries.length === 0) return enemy;

      // Process each attack and accumulate damage
      let totalDamage = 0;
      const attackers = [];

      // Get the terrain at the enemy position
      const terrainType = terrainMap.get(`${enemy.position.q},${enemy.position.r}`)?.type;
      if (!terrainType) return enemy; // Safety check

      // Calculate damage for each attacker
      for (const attackEntry of attackEntries) {
        const attackingPlayerId = attackEntry[0];
        const attackingPlayer = playerEntities.find((p) => p.id === attackingPlayerId);

        if (!attackingPlayer) continue;

        console.log(
          `Processing attack from ${attackingPlayer.entityType.type} on ${enemy.entityType.type}`
        );

        // Calculate damage for this attacker
        const damage = calculateAttackDamage(
          attackingPlayer.entityType,
          attackingPlayer.position,
          enemy.position,
          terrainType,
          enemy.entityType.combat.defense
        );

        if (damage > 0) {
          totalDamage += damage;
          attackers.push(attackingPlayer);

          const currentHealth = enemy.entityType.currentHealth ?? enemy.entityType.maxHealth;
          const newHealth = Math.max(0, currentHealth - damage);

          // Log individual attack
          log(generateEventMessage(attackingPlayer, enemy, damage, currentHealth, newHealth));
        }
      }

      // Apply the accumulated damage
      const currentHealth = enemy.entityType.currentHealth ?? enemy.entityType.maxHealth;
      const newHealth = Math.max(0, currentHealth - totalDamage);

      // Generate summary message if multiple attackers
      if (attackers.length > 1) {
        const attackerNames = attackers.map((a) => a.entityType.name).join(", ");
        log(
          `Combined attack on ${enemy.entityType.name} deals ${totalDamage} damage! (${currentHealth} → ${newHealth})`
        );
      } else if (attackers.length === 1) {
        // Already logged individual attack above
      }

      if (newHealth <= 0) {
        log(`${enemy.entityType.name} has been defeated!`);
      }

      return {
        ...enemy,
        entityType: {
          ...enemy.entityType,
          currentHealth: newHealth,
        },
        defeated: newHealth <= 0,
      };
    });

    // Apply damage from enemy attacks
    const updatedPlayerEntities = playerEntities.map((player) => {
      // Skip invalid or already defeated players
      if (!player || !player.id || player.defeated) return player;

      // Find ALL enemies who attacked this player
      const attackEntries = Array.from(enemyAttacks.entries()).filter(
        (entry) => entry[1] === player.id
      );

      // If this player wasn't attacked by any enemy, return it unchanged
      if (attackEntries.length === 0) return player;

      // Process each attack and accumulate damage
      let totalDamage = 0;
      const attackers = [];

      // Get the terrain at the player position
      const terrainType =
        terrainMap.get(`${player.position.q},${player.position.r}`)?.type ?? "grass";

      // Calculate damage for each attacker
      for (const attackEntry of attackEntries) {
        const attackingEnemyId = attackEntry[0];
        const attackingEnemy = enemyEntities.find((e) => e.id === attackingEnemyId);

        if (!attackingEnemy) continue;

        console.log(
          `Processing attack from enemy ${attackingEnemy.entityType.type} on player ${player.entityType.type}`
        );

        // Calculate damage for this attacker
        const damage = calculateAttackDamage(
          attackingEnemy.entityType,
          attackingEnemy.position,
          player.position,
          terrainType,
          player.entityType.combat.defense
        );

        if (damage > 0) {
          totalDamage += damage;
          attackers.push(attackingEnemy);

          // Log individual attack
          const currentHealth = player.entityType.currentHealth ?? player.entityType.maxHealth;
          const newHealth = Math.max(0, currentHealth - damage);
          log(generateEventMessage(attackingEnemy, player, damage, currentHealth, newHealth));
        }
      }

      // Apply the accumulated damage
      const currentHealth = player.entityType.currentHealth ?? player.entityType.maxHealth;
      const newHealth = Math.max(0, currentHealth - totalDamage);

      // Generate summary message if multiple attackers
      if (attackers.length > 1) {
        const attackerNames = attackers.map((a) => a.entityType.name).join(", ");
        log(
          `Combined enemy attack on ${player.entityType.name} deals ${totalDamage} damage! (${currentHealth} → ${newHealth})`
        );
      } else if (attackers.length === 1) {
        // Already logged individual attack above
      }

      if (newHealth <= 0) {
        log(`${player.entityType.name} has been defeated!`);
      }

      return {
        ...player,
        entityType: {
          ...player.entityType,
          currentHealth: newHealth,
        },
        defeated: newHealth <= 0,
      };
    });

    log(`~ Round ${roundNumber} ended ~`);

    // Call callback with final results
    combatResultCallback(updatedEnemyEntities, updatedPlayerEntities);
  }, 1500); // 1.5 second delay for visual feedback
};
