import { GridPosition, EntityDefinition, TerrainType, PlayerEntity, EnemyEntity, TerrainDefinition } from "./types";

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

/**
 * Executes the combat phase between player and enemy entities
 * Determines attacks based on adjacency and returns updated entities with combat damage applied
 * @param enemyEntities List of enemy entities
 * @param playerEntities List of player entities
 * @param terrainMap Map of terrain types by position key
 * @param callback Function called after combat resolution with updated entities and results
 */
export const executeCombat = (
  enemyEntities: EnemyEntity[],
  playerEntities: PlayerEntity[],
  terrainMap: Map<string, TerrainDefinition>,
  callback: (updatedEnemies: EnemyEntity[], updatedPlayers: PlayerEntity[], defeatedEnemies: number, defeatedPlayers: number) => void
) => {
  // Track which enemies are attacked by which players
  const playerAttacks = new Map<string, string>();
  // Track which players are attacked by which enemies
  const enemyAttacks = new Map<string, string>();

  // Determine which enemies each player attacks (closest enemy)
  playerEntities.forEach((player) => {
    // Ensure player is valid with an id
    if (!player || !player.id || typeof player.id !== 'string') return;
    
    let closestEnemy: EnemyEntity | null = null;
    let minDistance = Infinity;

    // Check all enemy entities to find the closest one
    enemyEntities.forEach((enemy) => {
      // Skip if enemy is invalid or missing position
      if (!enemy || !enemy.position) return;
      
      const distance = calculateHexDistance(player.position, enemy.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemy;
      }
    });

    // Track player attack if they're adjacent to an enemy
    if (closestEnemy && minDistance <= 1 && 'id' in closestEnemy && closestEnemy.id) {
      playerAttacks.set(player.id, closestEnemy.id);
    }
  });

  // Determine which players each enemy attacks (closest player)
  enemyEntities.forEach((enemy) => {
    // Ensure enemy is valid with an id
    if (!enemy || !enemy.id || typeof enemy.id !== 'string') return;
    
    let closestPlayer: PlayerEntity | null = null;
    let minDistance = Infinity;

    // Check all player entities to find the closest one
    playerEntities.forEach((player) => {
      // Skip if player is invalid or missing position
      if (!player || !player.position) return;
      
      const distance = calculateHexDistance(enemy.position, player.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    });

    // Track enemy attack if they're adjacent to a player
    if (closestPlayer && minDistance <= 1 && 'id' in closestPlayer && closestPlayer.id) {
      enemyAttacks.set(enemy.id, closestPlayer.id);
    }
  });

  console.log("Combat phase: Player attacks", playerAttacks);
  console.log("Combat phase: Enemy attacks", enemyAttacks);

  // Apply combat damage after a delay
  setTimeout(() => {
    // Apply damage from player attacks
    const updatedEnemyEntities = enemyEntities.map((enemy) => {
      // Skip invalid enemies
      if (!enemy || !enemy.id) return enemy;
      
      // Find if this enemy was attacked by any player
      const attackEntry = Array.from(playerAttacks.entries())
        .find(entry => entry[1] === enemy.id);
      
      const attackingPlayerId = attackEntry ? attackEntry[0] : undefined;
      
      // If this enemy was attacked, reduce its health by 1
      if (attackingPlayerId !== undefined) {
        console.log(`Enemy ${enemy.id} was attacked by Player ${attackingPlayerId}`);
        
        // Get current health, defaulting to max health if current health is not set
        const currentHealth = 
          typeof enemy.entityType.currentHealth === 'number' 
            ? enemy.entityType.currentHealth 
            : enemy.entityType.maxHealth;
        
        return {
          ...enemy,
          entityType: {
            ...enemy.entityType,
            currentHealth: Math.max(0, currentHealth - 1)
          }
        };
      }
      
      return enemy;
    });

    // Apply damage from enemy attacks
    const updatedPlayerEntities = playerEntities.map((player) => {
      // Skip invalid players
      if (!player || !player.id) return player;
      
      // Find if this player was attacked by any enemy
      const attackEntry = Array.from(enemyAttacks.entries())
        .find(entry => entry[1] === player.id);
      
      const attackingEnemyId = attackEntry ? attackEntry[0] : undefined;
      
      // If this player was attacked, reduce their health by 1
      if (attackingEnemyId !== undefined) {
        console.log(`Player ${player.id} was attacked by Enemy ${attackingEnemyId}`);
        
        // Get current health, defaulting to max health if current health is not set
        const currentHealth = 
          typeof player.entityType.currentHealth === 'number' 
            ? player.entityType.currentHealth 
            : player.entityType.maxHealth;
        
        return {
          ...player,
          entityType: {
            ...player.entityType,
            currentHealth: Math.max(0, currentHealth - 1)
          }
        };
      }
      
      return player;
    });

    // Filter out defeated entities (those with health at 0)
    const survivingEnemyEntities = updatedEnemyEntities.filter(enemy => {
      const health = enemy.entityType.currentHealth ?? enemy.entityType.maxHealth;
      return health > 0;
    });
    
    const survivingPlayerEntities = updatedPlayerEntities.filter(player => {
      const health = player.entityType.currentHealth ?? player.entityType.maxHealth;
      return health > 0;
    });

    // Calculate combat results
    const defeatedEnemies = updatedEnemyEntities.length - survivingEnemyEntities.length;
    const defeatedPlayers = updatedPlayerEntities.length - survivingPlayerEntities.length;
    
    if (defeatedEnemies > 0 || defeatedPlayers > 0) {
      console.log(`Combat results: ${defeatedEnemies} enemies defeated, ${defeatedPlayers} players defeated`);
    }

    // Call the callback with the updated entities
    callback(
      survivingEnemyEntities, 
      survivingPlayerEntities as PlayerEntity[], 
      defeatedEnemies, 
      defeatedPlayers
    );
  }, 1500); // 1.5 second delay for visual feedback
};
