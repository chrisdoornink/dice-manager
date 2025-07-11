import { Behavior, EnemyEntity, GridPosition, Situation, TerrainDefinition } from "../utils/types";

// Define TerrainMap type for our usage
type TerrainMap = Map<string, TerrainDefinition>;

// Define different AI behaviors
export type EnemyBehavior =
  | "aggressive" // Approaches nearest player
  | "defensive" // Keeps distance from players
  | "flanking" // Tries to circle around players
  | "random" // Moves randomly
  | "stationary"; // Doesn't move unless provoked

interface EnemyMove {
  enemyId: string;
  targetPosition: GridPosition;
}

/**
 * Calculates the distance between two positions on the grid
 */
const calculateDistance = (a: GridPosition, b: GridPosition): number => {
  // Use the cube coordinate distance formula for hexagons
  const ac = { x: a.q, y: -a.q - a.r, z: a.r };
  const bc = { x: b.q, y: -b.q - b.r, z: b.r };
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
};

/**
 * Find valid neighbors for a position
 */
const getValidNeighbors = (
  position: GridPosition,
  terrainMap: TerrainMap,
  enemies: EnemyEntity[],
  pendingEnemyMoves: Map<string, GridPosition>,
  playerPositions: GridPosition[] = [],
  allowMoveOntoDefeatedEntities: boolean = false
): GridPosition[] => {
  // Hexagon neighbor directions (q, r)
  const directions = [
    { q: 1, r: 0 }, // East
    { q: 1, r: -1 }, // Northeast
    { q: 0, r: -1 }, // Northwest
    { q: -1, r: 0 }, // West
    { q: -1, r: 1 }, // Southwest
    { q: 0, r: 1 }, // Southeast
  ];

  return directions
    .map((dir) => {
      const newPos = { q: position.q + dir.q, r: position.r + dir.r };

      // STRICT CHECK: Explicitly verify the position exists in the terrain map
      // This prevents moving to positions off the board
      const terrainKey = `${newPos.q},${newPos.r}`;
      if (!terrainMap.has(terrainKey)) return null;

      // Check if position has valid terrain (not water)
      const terrain = terrainMap.get(terrainKey);
      if (!terrain || terrain.type === "water") return null;

      // Check if position is occupied by a player
      const isPlayerOccupied = playerPositions.some(
        (player) => player.q === newPos.q && player.r === newPos.r
      );

      if (isPlayerOccupied) return null;

      // Check if position won't be occupied by other enemies
      const willBeOccupied = enemies.some((enemy) => {
        // Skip this enemy itself
        if (enemy.position.q === position.q && enemy.position.r === position.r) return false;

        // If we allow moving onto defeated entities and this enemy is defeated,
        // don't consider it as occupying the space
        if (allowMoveOntoDefeatedEntities && enemy.defeated) return false;

        // Check if enemy's current position matches target
        if (enemy.position.q === newPos.q && enemy.position.r === newPos.r) {
          // But if this enemy has a pending move, its current position will be vacant
          return !pendingEnemyMoves.has(enemy.id);
        }

        // Check if any enemy is moving to this position
        if (pendingEnemyMoves.has(enemy.id)) {
          const pendingMove = pendingEnemyMoves.get(enemy.id);
          return pendingMove?.q === newPos.q && pendingMove?.r === newPos.r;
        }

        return false;
      });

      if (willBeOccupied) return null;

      return newPos;
    })
    .filter((pos): pos is GridPosition => pos !== null);
};

/**
 * Custom hook for enemy AI movement logic
 */
const useEnemyAI = () => {
  /**
   * Determines move for an aggressive enemy that approaches players
   */
  const getAggressiveMove = (
    enemy: EnemyEntity,
    playerPositions: GridPosition[],
    terrainMap: TerrainMap,
    enemies: EnemyEntity[],
    pendingEnemyMoves: Map<string, GridPosition>,
    allowMoveOntoDefeatedEntities: boolean = false
  ): GridPosition | null => {
    if (playerPositions.length === 0) return null;

    // Find the nearest player
    const nearestPlayer = playerPositions.reduce(
      (nearest, player) => {
        const distance = calculateDistance(enemy.position, player);
        if (distance < nearest.distance) {
          return { position: player, distance };
        }
        return nearest;
      },
      { position: playerPositions[0], distance: Infinity }
    );

    // If already adjacent to a player, stay put
    if (nearestPlayer.distance <= 1) return enemy.position;

    // Get valid neighboring positions
    const neighbors = getValidNeighbors(
      enemy.position,
      terrainMap,
      enemies,
      pendingEnemyMoves,
      playerPositions,
      allowMoveOntoDefeatedEntities
    );
    if (neighbors.length === 0) return null;

    // Find the neighbor that gets us closest to the nearest player
    return neighbors.reduce(
      (best, pos) => {
        const distance = calculateDistance(pos, nearestPlayer.position);
        if (distance < best.distance) {
          return { position: pos, distance };
        }
        return best;
      },
      { position: neighbors[0], distance: calculateDistance(neighbors[0], nearestPlayer.position) }
    ).position;
  };

  /**
   * Determines move for a defensive enemy that keeps distance
   */
  const getDefensiveMove = (
    enemy: EnemyEntity,
    playerPositions: GridPosition[],
    terrainMap: TerrainMap,
    enemies: EnemyEntity[],
    pendingEnemyMoves: Map<string, GridPosition>,
    allowMoveOntoDefeatedEntities: boolean = false
  ): GridPosition | null => {
    if (playerPositions.length === 0) return null;

    // Find the nearest player
    const nearestPlayer = playerPositions.reduce(
      (nearest, player) => {
        const distance = calculateDistance(enemy.position, player);
        if (distance < nearest.distance) {
          return { position: player, distance };
        }
        return nearest;
      },
      { position: playerPositions[0], distance: Infinity }
    );

    // If far enough away from players, stay put
    if (nearestPlayer.distance >= 4) return enemy.position;

    // Get valid neighboring positions
    const neighbors = getValidNeighbors(
      enemy.position,
      terrainMap,
      enemies,
      pendingEnemyMoves,
      playerPositions,
      allowMoveOntoDefeatedEntities
    );
    if (neighbors.length === 0) return null;

    // Find the neighbor that gets us furthest from the nearest player
    return neighbors.reduce(
      (best, pos) => {
        const distance = calculateDistance(pos, nearestPlayer.position);
        if (distance > best.distance) {
          return { position: pos, distance };
        }
        return best;
      },
      { position: neighbors[0], distance: calculateDistance(neighbors[0], nearestPlayer.position) }
    ).position;
  };

  /**
   * Determines move for a flanking enemy that circles players
   */
  const getFlankingMove = (
    enemy: EnemyEntity,
    playerPositions: GridPosition[],
    terrainMap: TerrainMap,
    enemies: EnemyEntity[],
    pendingEnemyMoves: Map<string, GridPosition>,
    allowMoveOntoDefeatedEntities: boolean = false
  ): GridPosition | null => {
    if (playerPositions.length === 0) return null;

    // Find the nearest player
    const nearestPlayer = playerPositions.reduce(
      (nearest, player) => {
        const distance = calculateDistance(enemy.position, player);
        if (distance < nearest.distance) {
          return { position: player, distance };
        }
        return nearest;
      },
      { position: playerPositions[0], distance: Infinity }
    );

    // Get valid neighboring positions
    const neighbors = getValidNeighbors(
      enemy.position,
      terrainMap,
      enemies,
      pendingEnemyMoves,
      playerPositions,
      allowMoveOntoDefeatedEntities
    );
    if (neighbors.length === 0) return null;

    // For flanking, we want to maintain a medium distance (not too close, not too far)
    // and prefer positions that are perpendicular to the direct line to the player
    return neighbors.reduce(
      (best, pos) => {
        const distance = calculateDistance(pos, nearestPlayer.position);

        // Calculate how perpendicular this move is (higher is better)
        // We use the cube coordinates for this calculation
        const ac = {
          x: enemy.position.q,
          y: -enemy.position.q - enemy.position.r,
          z: enemy.position.r,
        };
        const bc = {
          x: nearestPlayer.position.q,
          y: -nearestPlayer.position.q - nearestPlayer.position.r,
          z: nearestPlayer.position.r,
        };
        const pc = { x: pos.q, y: -pos.q - pos.r, z: pos.r };

        // Vector from enemy to player
        const vep = { x: bc.x - ac.x, y: bc.y - ac.y, z: bc.z - ac.z };

        // Vector from enemy to new position
        const ven = { x: pc.x - ac.x, y: pc.y - ac.y, z: pc.z - ac.z };

        // Cross product magnitude is highest when vectors are perpendicular
        const crossProduct = Math.abs(
          vep.y * ven.z -
            vep.z * ven.y +
            vep.z * ven.x -
            vep.x * ven.z +
            vep.x * ven.y -
            vep.y * ven.x
        );

        // We want to maintain a distance of around 2-3 hexes
        const distanceScore = Math.abs(distance - 2.5);

        // Combine distance and perpendicularity for overall score
        const score = crossProduct - distanceScore;

        if (score > best.score) {
          return { position: pos, score };
        }
        return best;
      },
      { position: neighbors[0], score: -Infinity }
    ).position;
  };

  /**
   * Determines a random move
   */
  const getRandomMove = (
    enemy: EnemyEntity,
    playerPositions: GridPosition[],
    terrainMap: TerrainMap,
    enemies: EnemyEntity[],
    pendingEnemyMoves: Map<string, GridPosition>,
    allowMoveOntoDefeatedEntities: boolean = false
  ): GridPosition | null => {
    // Get valid neighboring positions
    const neighbors = getValidNeighbors(
      enemy.position,
      terrainMap,
      enemies,
      pendingEnemyMoves,
      playerPositions,
      allowMoveOntoDefeatedEntities
    );
    if (neighbors.length === 0) return null;

    // Pick a random valid position
    const randomIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[randomIndex];
  };

  /**
   * Determines move for a stationary enemy
   */
  const getStationaryMove = (enemy: EnemyEntity): GridPosition => {
    // Stationary enemies don't move
    return enemy.position;
  };

  /**
   * Calculate enemy moves based on their behavior
   */
  const calculateEnemyMoves = (
    enemies: EnemyEntity[],
    playerPositions: GridPosition[],
    terrainMap: TerrainMap,
    allowMoveOntoDefeatedEntities: boolean = false
  ): Map<string, GridPosition> => {
    const enemyMoves = new Map<string, GridPosition>();

    // Process each enemy (skip defeated enemies)
    for (const enemy of enemies) {
      // Skip processing for defeated enemies
      if (enemy.defeated) {
        continue;
      }

      let targetPosition: GridPosition | null = null;

      const behavior = getBehaviorForEnemyMove(enemy, terrainMap, enemies, enemyMoves);
      console.log("the behavior is: ", behavior, "for enemy: ", enemy.entityType.name);

      // Calculate move based on behavior
      switch (behavior.key) {
        case "aggressive":
          targetPosition = getAggressiveMove(
            enemy,
            playerPositions,
            terrainMap,
            enemies,
            enemyMoves,
            allowMoveOntoDefeatedEntities
          );
          break;
        case "defensive":
          targetPosition = getDefensiveMove(
            enemy,
            playerPositions,
            terrainMap,
            enemies,
            enemyMoves,
            allowMoveOntoDefeatedEntities
          );
          break;
        case "flanking":
          targetPosition = getFlankingMove(
            enemy,
            playerPositions,
            terrainMap,
            enemies,
            enemyMoves,
            allowMoveOntoDefeatedEntities
          );
          break;
        case "random":
          targetPosition = getRandomMove(
            enemy,
            playerPositions,
            terrainMap,
            enemies,
            enemyMoves,
            allowMoveOntoDefeatedEntities
          );
          break;
        case "stationary":
          targetPosition = getStationaryMove(enemy);
          break;
      }

      // If a valid move was found, add it to the pending moves
      if (targetPosition) {
        enemyMoves.set(enemy.id, targetPosition);
      }
    }

    return enemyMoves;
  };

  return {
    calculateEnemyMoves,
  };
};

export default useEnemyAI;

const getBehaviorSeed = (situation: Situation): number => {
  // Calcluate the total number of seeds in the given situation
  const totalSeeds = situation.reduce((total, behavior) => total + behavior.value, 0);
  // Generate a random number between 0 and the total number of seeds
  const behaviorSeed = Math.floor(Math.random() * totalSeeds);

  return behaviorSeed;
};

// An entity will have a set of behaviors that determine how it moves
// There are 3 catagories of behaviors:
// 1. Default behavior
// 2. In group behavior
// 3. Alone behavior
// Each one has a set of behaviors that determine how it moves and a weight for each behavior
// The behavior is determined by a random number between 0 and 100, the weight is used to determine the probability of each behavior
// Function to find neighboring tiles occupied by enemies
const getEnemyNeighbors = (
  position: GridPosition,
  terrainMap: TerrainMap,
  enemies: EnemyEntity[],
  pendingEnemyMoves: Map<string, GridPosition>,
  enemyPositions: GridPosition[]
): GridPosition[] => {
  // Hexagon neighbor directions (q, r)
  // expands to 2 tiles away in each direction
  const directions = [
    { q: 1, r: 0 }, // East
    { q: 1, r: -1 }, // Northeast
    { q: 0, r: -1 }, // Northwest
    { q: -1, r: 0 }, // West
    { q: -1, r: 1 }, // Southwest
    { q: 0, r: 1 }, // Southeast
  ];

  return directions
    .map((dir) => {
      const newPos = { q: position.q + dir.q, r: position.r + dir.r };
      const terrainKey = `${newPos.q},${newPos.r}`;

      // Skip invalid terrain positions
      if (!terrainMap.has(terrainKey)) return null;
      const terrain = terrainMap.get(terrainKey);
      if (!terrain || terrain.type === "water") return null;

      // Check if position is occupied by another enemy
      const isEnemyOccupied = enemyPositions.some(
        (enemyPos) =>
          // Skip this enemy itself
          !(enemyPos.q === position.q && enemyPos.r === position.r) &&
          // Check if another enemy is at this position
          enemyPos.q === newPos.q &&
          enemyPos.r === newPos.r
      );

      // Only return the position if it's occupied by another enemy
      return isEnemyOccupied ? newPos : null;
    })
    .filter((pos): pos is GridPosition => pos !== null);
};

// The behavior is then mapped to a behavior type
// The behavior type is then used to determine the move
const getBehaviorForEnemyMove = (
  enemy: EnemyEntity,
  terrainMap: TerrainMap,
  enemies: EnemyEntity[],
  pendingEnemyMoves: Map<string, GridPosition>
): Behavior => {
  const situation = getCurrentEnemySituation(enemy, terrainMap, enemies, pendingEnemyMoves);
  console.log("the enemy situation is: ", situation);

  // Now that we have the situation, we can use it to determine the behavior by
  // taking its weights and applying it to the behavior seed
  return getBehaviorForSituation(situation);
};

// We need to look at the current map to determine if the enemy is in a group or alone
const getCurrentEnemySituation = (
  enemy: EnemyEntity,
  terrainMap: TerrainMap,
  enemies: EnemyEntity[],
  pendingEnemyMoves: Map<string, GridPosition>
): Situation => {
  const enemyPositions = enemies.map((enemy) => enemy.position);
  const enemyPosition = enemy.position;
  const enemyNeighbors = getEnemyNeighbors(
    enemyPosition,
    terrainMap,
    enemies,
    pendingEnemyMoves,
    enemyPositions
  );
  const enemyNeighborCount = enemyNeighbors.length;
  console.log("current enemy: ", enemy.entityType.name, "has ", enemyNeighborCount, "neighbors");
  console.log("current enemy behavior: ", enemy.entityType.behavior);
  if (enemyNeighborCount > 1) {
    return enemy.entityType.behavior.inGroup;
  } else if (enemyNeighborCount === 0) {
    return enemy.entityType.behavior.alone;
  }

  return enemy.entityType.behavior.default;
};

// Takes a seed between 0 and 100, a situation, applies the weights across the range
// Returns a spread of behaviors based on the weights
// ex: Situation: [{ key: "aggressive", value: 1 }, { key: "defensive", value: 2 }, { key: "flanking", value: 0 }, { key: "random", value: 1 }, { key: "stationary", value: 1 }]
// result: ["aggressive", "defensive", "defensive", "random", "stationary"]
const createSpreadOfBehaviors = (situation: Situation): Behavior[] => {
  const spread: Behavior[] = [];
  for (const behavior of situation) {
    const weight = behavior.value;
    for (let i = 0; i < weight; i++) {
      spread.push(behavior);
    }
  }

  return spread;
};
// this will return a Situation key based on the weights in the situation
const getBehaviorForSituation = (situation: Situation): Behavior => {
  const behaviorSeed = getBehaviorSeed(situation);
  const spread = createSpreadOfBehaviors(situation);
  const behavior = spread[behaviorSeed];
  return behavior;
};
