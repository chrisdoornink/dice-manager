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

    // Track enemy attack if they're adjacent to a player
    if (closestPlayer && minDistance <= 1 && "id" in closestPlayer && closestPlayer.id) {
      enemyAttacks.set(enemy.id, closestPlayer.id);
    }
  });

  // Apply combat damage after a delay
  setTimeout(() => {
    // Apply damage from player attacks
    const updatedEnemyEntities = enemyEntities.map((enemy) => {
      // Skip invalid or already defeated enemies
      if (!enemy || !("id" in enemy) || !enemy.id || enemy.defeated) return enemy;

      // Find if this enemy was attacked by any player
      const attackEntry = Array.from(playerAttacks.entries()).find(
        (entry) => entry[1] === enemy.id
      );

      const attackingPlayerId = attackEntry ? attackEntry[0] : undefined;

      // If this enemy was attacked, calculate damage
      if (attackingPlayerId !== undefined) {
        // Player attacked this enemy
        const attackingPlayer = playerEntities.find((p) => p.id === attackingPlayerId);

        if (!attackingPlayer || !enemy) return enemy;

        const terrainType = terrainMap.get(`${enemy.position.q},${enemy.position.r}`)?.type;

        if (!terrainType) return enemy;

        // Calculate damage based on player's combat power and enemy's defense
        let damage = calculateAttackDamage(
          attackingPlayer.entityType,
          attackingPlayer.position,
          enemy.position,
          terrainType,
          enemy.entityType.combat.defense
        );

        const currentHealth = enemy.entityType.currentHealth ?? enemy.entityType.maxHealth;
        const newHealth = Math.max(0, currentHealth - damage);
        const attackerName = attackingPlayer?.entityType.name ?? "Unknown";
        const targetName = enemy.entityType.name;
        const eventMessage = generateEventMessage(
          attackingPlayer,
          enemy,
          damage,
          currentHealth,
          newHealth
        );
        log(eventMessage);

        if (newHealth <= 0) {
          log(`${targetName} has been defeated!`);
        }

        return {
          ...enemy,
          entityType: {
            ...enemy.entityType,
            currentHealth: newHealth,
          },
        };
      }

      return enemy;
    });

    // Apply damage from enemy attacks
    const updatedPlayerEntities = playerEntities.map((player) => {
      // Skip invalid or already defeated players
      if (!player || !player.id || player.defeated) return player;

      // Find if this player was attacked by any enemy
      const attackEntry = Array.from(enemyAttacks.entries()).find(
        (entry) => entry[1] === player.id
      );

      const attackingEnemyId = attackEntry ? attackEntry[0] : undefined;

      // If this player was attacked, calculate damage and reduce health
      if (attackingEnemyId !== undefined) {
        // Enemy attacked this player
        const attackingEnemy = enemyEntities.find((e) => e.id === attackingEnemyId);

        if (!attackingEnemy) return player;

        // Calculate damage based on enemy's combat power and player's defense
        let damage = calculateAttackDamage(
          attackingEnemy.entityType,
          attackingEnemy.position,
          player.position,
          player.entityType.abilities.canShootOverWater ? "water" : "grass",
          player.entityType.combat.defense
        ); // Default damage

        const currentHealth = player.entityType.currentHealth ?? player.entityType.maxHealth;
        const newHealth = Math.max(0, currentHealth - damage);
        const attackerName = attackingEnemy?.entityType.type ?? "Unknown";
        const targetName = player.id;
        log(generateEventMessage(attackingEnemy, player, damage, currentHealth, newHealth));

        if (newHealth <= 0) {
          log(`${targetName} has been defeated!`);
        }

        return {
          ...player,
          entityType: {
            ...player.entityType,
            currentHealth: newHealth,
          },
          defeated: newHealth <= 0,
        };
      }

      return player;
    });

    // Filter out defeated entities (those with health at 0)
    // const survivingEnemyEntities = updatedEnemyEntities.filter((enemy): enemy is EnemyEntity => {
    //   if (!enemy) return false;
    //   const health = enemy.entityType.currentHealth ?? enemy.entityType.maxHealth;
    //   return health > 0;
    // });

    // const survivingPlayerEntities = updatedPlayerEntities.filter(
    //   (player): player is PlayerEntity => {
    //     if (!player) return false;
    //     const health = player.entityType.currentHealth ?? player.entityType.maxHealth;
    //     return health > 0;
    //   }
    // );

    // Filter out defeated entities
    const survivingEnemyEntities = updatedEnemyEntities.filter((enemy) => !enemy.defeated);
    const survivingPlayerEntities = updatedPlayerEntities.filter((player) => !player.defeated);

    // Calculate combat results
    const initialEnemyCount = enemyEntities.length;
    const initialPlayerCount = playerEntities.length;
    const defeatedEnemies = initialEnemyCount - updatedEnemyEntities.length;
    const defeatedPlayers = initialPlayerCount - updatedPlayerEntities.length;

    log(
      `Round ${roundNumber} ended with ${
        initialEnemyCount - updatedEnemyEntities.length
      } enemies and ${initialPlayerCount - updatedPlayerEntities.length} players defeated.`
    );

    // Call callback with final results
    combatResultCallback(updatedEnemyEntities, updatedPlayerEntities);
  }, 1500); // 1.5 second delay for visual feedback
};
