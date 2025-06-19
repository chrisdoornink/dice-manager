import { useCallback, useEffect, useState } from "react";
import { GridPosition, TerrainDefinition, PlayerEntity, EnemyEntity } from "../utils/types";
import { generateTerrainMap } from "../utils/generateTerrainMap";
import { getNeighboringTiles } from "../utils/getNeigboringTiles";
import { playerUnitTypes, enemyUnitTypes } from "../utils/entityTypes";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  terrainMapToArray,
  arrayToTerrainMap,
} from "../utils/gameState";

// Types for placement strategies
export type PlacementStrategy = "center" | "corners" | "edges" | "random" | "spread";
export type EnemyPlacementStrategy = "opposite" | "surrounding" | "far" | "random";

// Map configuration type for saving and loading presets
export interface MapConfig {
  id?: string;
  name?: string;
  playerPlacement: PlacementStrategy;
  enemyPlacement: EnemyPlacementStrategy;
  date?: string; // For daily challenges
  createdAt?: number;
}

interface UseGameInitializationProps {
  allGridPositions: GridPosition[];
  setTerrainMap: React.Dispatch<React.SetStateAction<Map<string, TerrainDefinition>>>;
  setPlayerEntities: React.Dispatch<React.SetStateAction<PlayerEntity[]>>;
  setEnemyEntities: React.Dispatch<React.SetStateAction<EnemyEntity[]>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
  setPendingMoves: React.Dispatch<React.SetStateAction<Map<string, GridPosition>>>;
  setSelectedEntity: React.Dispatch<React.SetStateAction<PlayerEntity | null>>;
  setMovementRangeHexagons: React.Dispatch<React.SetStateAction<GridPosition[]>>;
  setIsSelectingDestination: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useGameInitialization = ({
  allGridPositions,
  setTerrainMap,
  setPlayerEntities,
  setEnemyEntities,
  setCurrentTurn,
  setPendingMoves,
  setSelectedEntity,
  setMovementRangeHexagons,
  setIsSelectingDestination,
}: UseGameInitializationProps) => {
  // Helper function to get a position key for map lookups
  const getPosKey = (pos: GridPosition): string => `${pos.q},${pos.r}`;
  
  // Helper function to check if a position is valid (exists in terrain and is not water)
  const isValidPosition = useCallback((pos: GridPosition, terrainMap: Map<string, TerrainDefinition>, avoidTerrainTypes: string[] = ["water"]) => {
    const posKey = getPosKey(pos);
    const terrain = terrainMap.get(posKey);
    return terrain && !avoidTerrainTypes.includes(terrain.type);
  }, []);
  
  // Helper function to check if a position is already occupied by any entity
  const isPositionOccupied = (pos: GridPosition, occupiedPositions: GridPosition[]): boolean => {
    return occupiedPositions.some(occupied => occupied.q === pos.q && occupied.r === pos.r);
  };

  // Get player positions based on chosen strategy
  const getPlayerPositions = useCallback((allPositions: GridPosition[], terrainMap: Map<string, TerrainDefinition>, count: number, strategy: PlacementStrategy = "center", occupiedPositions: GridPosition[] = []): GridPosition[] => {
    // Filter positions for valid terrain (not water)
    const validPositions = allPositions.filter(pos => isValidPosition(pos, terrainMap));
    
    if (validPositions.length === 0) return [];
    
    let candidatePositions: GridPosition[] = [];
    const center = { q: 0, r: 0 };
    
    // Different strategies for player placement
    switch (strategy) {
      case "center":
        // Place entities near the center of the map
        candidatePositions = validPositions.sort((a, b) => {
          const distA = Math.abs(a.q) + Math.abs(a.r);
          const distB = Math.abs(b.q) + Math.abs(b.r);
          return distA - distB; // Closest to center first
        });
        break;
        
      case "corners":
        // Find positions near the corners of the map
        candidatePositions = validPositions.sort((a, b) => {
          // For corners, we want positions with high absolute q and r values
          const cornerValueA = Math.abs(a.q) + Math.abs(a.r);
          const cornerValueB = Math.abs(b.q) + Math.abs(b.r);
          return cornerValueB - cornerValueA; // Furthest from center first
        });
        break;
        
      case "edges":
        // Find positions along the edges of the map
        const maxDist = Math.max(...validPositions.map(p => Math.abs(p.q) + Math.abs(p.r)));
        candidatePositions = validPositions.filter(p => {
          const dist = Math.abs(p.q) + Math.abs(p.r);
          return dist > maxDist * 0.7; // Consider positions in the outer 30% as edges
        }).sort(() => Math.random() - 0.5); // Randomize edge positions
        break;
        
      case "spread":
        // Attempt to find positions that are well-spread from each other
        candidatePositions = validPositions.slice(); // Copy array
        const selectedPositions: GridPosition[] = [];
        
        // Start with a random valid position
        if (candidatePositions.length > 0) {
          const randomIndex = Math.floor(Math.random() * candidatePositions.length);
          selectedPositions.push(candidatePositions[randomIndex]);
          candidatePositions.splice(randomIndex, 1);
        }
        
        // Then find positions that maximize distance from already selected positions
        while (selectedPositions.length < count && candidatePositions.length > 0) {
          let bestPosition = candidatePositions[0];
          let maxMinDistance = 0;
          
          for (const candidate of candidatePositions) {
            // Find minimum distance to any already selected position
            let minDistance = Number.MAX_VALUE;
            for (const selected of selectedPositions) {
              const distance = Math.abs(candidate.q - selected.q) + Math.abs(candidate.r - selected.r);
              minDistance = Math.min(minDistance, distance);
            }
            
            // Keep track of the candidate with the maximum minimum distance
            if (minDistance > maxMinDistance) {
              maxMinDistance = minDistance;
              bestPosition = candidate;
            }
          }
          
          selectedPositions.push(bestPosition);
          candidatePositions = candidatePositions.filter(p => !(p.q === bestPosition.q && p.r === bestPosition.r));
        }
        
        candidatePositions = selectedPositions;
        break;
        
      case "random":
      default:
        // Completely random placement
        candidatePositions = validPositions.sort(() => Math.random() - 0.5);
        break;
    }
    
    // Filter out positions that are already occupied
    candidatePositions = candidatePositions.filter(pos => !isPositionOccupied(pos, occupiedPositions));
    
    // Return the requested number of positions or as many as available
    return candidatePositions.slice(0, count);
  }, [isValidPosition]);

  // Get enemy positions based on chosen strategy relative to player positions
  const getEnemyPositions = useCallback((allPositions: GridPosition[], terrainMap: Map<string, TerrainDefinition>, playerPositions: GridPosition[], count: number, strategy: EnemyPlacementStrategy = "far", occupiedPositions: GridPosition[] = []): GridPosition[] => {
    // Start with all valid positions (not water and not occupied)
    const validPositions = allPositions.filter(pos => {
      return isValidPosition(pos, terrainMap) && !isPositionOccupied(pos, occupiedPositions);
    });
    
    if (validPositions.length === 0) return [];
    
    let candidatePositions: GridPosition[] = [];
    
    // Calculate player centroid (average position)
    const playerCentroid = playerPositions.reduce(
      (acc, pos) => ({ q: acc.q + pos.q, r: acc.r + pos.r }),
      { q: 0, r: 0 }
    );
    playerCentroid.q /= playerPositions.length || 1;
    playerCentroid.r /= playerPositions.length || 1;
    
    // Different strategies for enemy placement
    switch (strategy) {
      case "opposite":
        // Place enemies opposite to the players (across the center)
        candidatePositions = validPositions.sort((a, b) => {
          // For each position, calculate how well it represents the "opposite" of player centroid
          const oppositePoint = { q: -playerCentroid.q, r: -playerCentroid.r };
          const distA = Math.abs(a.q - oppositePoint.q) + Math.abs(a.r - oppositePoint.r);
          const distB = Math.abs(b.q - oppositePoint.q) + Math.abs(b.r - oppositePoint.r);
          return distA - distB; // Closest to the opposite point first
        });
        break;
        
      case "surrounding":
        // Place enemies in a surrounding pattern around players
        // First we need positions that are not too close but not too far
        const surroundingRingPositions = validPositions.filter(pos => {
          // Calculate min distance to any player
          const minDist = Math.min(...playerPositions.map(pPos => 
            Math.abs(pos.q - pPos.q) + Math.abs(pos.r - pPos.r)
          ));
          // We want positions that are at a middle distance (not too close, not too far)
          return minDist >= 2 && minDist <= 4;
        });
        
        // Sort these positions to distribute them around the players
        candidatePositions = surroundingRingPositions.length > 0 ? 
          surroundingRingPositions.sort(() => Math.random() - 0.5) : 
          validPositions.sort(() => Math.random() - 0.5);
        break;
        
      case "far":
        // Place enemies far from players
        candidatePositions = validPositions.sort((a, b) => {
          // Calculate minimum distance from any player
          const minDistA = Math.min(...playerPositions.map(p => 
            Math.abs(a.q - p.q) + Math.abs(a.r - p.r)
          ));
          const minDistB = Math.min(...playerPositions.map(p => 
            Math.abs(b.q - p.q) + Math.abs(b.r - p.r)
          ));
          return minDistB - minDistA; // Furthest from any player first
        });
        break;
        
      case "random":
      default:
        // Completely random placement
        candidatePositions = validPositions.sort(() => Math.random() - 0.5);
        break;
    }
    
    // Return the requested number of positions
    return candidatePositions.slice(0, count);
  }, [isValidPosition]);

  // Initialize a new game with optional placement strategies
  const initializeNewGame = useCallback((playerStrategy: PlacementStrategy = "center", enemyStrategy: EnemyPlacementStrategy = "far") => {
    if (allGridPositions.length > 0) {
      const newTerrainMap = generateTerrainMap(allGridPositions);
      setTerrainMap(newTerrainMap);

      // Get player positions based on the selected strategy
      const playerPositions = getPlayerPositions(
        allGridPositions,
        newTerrainMap,
        4, // We want 4 positions for our player entities
        playerStrategy,
        [] // No occupied positions initially
      );
      
      // Fallback positions in case we couldn't get enough valid positions
      const fallbackPositions = [
        { q: 0, r: 0 },
        { q: 1, r: -1 },
        { q: -1, r: 1 },
        { q: 0, r: -1 },
      ];
      
      // Helper function to initialize entity with random health within its range
      const initializeWithHealth = (unitType: any, key: string) => {
        const baseType = { ...unitType[key] };

        if (baseType.minHealth !== undefined && baseType.maxHealth !== undefined) {
          // Set the current health to a random value between minHealth and maxHealth (inclusive)
          const randomHealth =
            Math.floor(Math.random() * (baseType.maxHealth - baseType.minHealth + 1)) +
            baseType.minHealth;
          const startingHealth = randomHealth;
          const kills = 0;
          return {
            ...baseType,
            currentHealth: startingHealth,
            startingHealth,
            kills,
          };
        }

        // If no health attributes are defined, set defaults
        return {
          ...baseType,
          minHealth: 1,
          maxHealth: 3,
          currentHealth: 3,
        };
      };

      // Create the player entities at the selected positions
      const newPlayerEntities: PlayerEntity[] = [
        {
          id: "archer-1",
          position: playerPositions[0] || fallbackPositions[0],
          entityType: initializeWithHealth(playerUnitTypes, "archer"),
        },
        {
          id: "cavalry-1",
          position: playerPositions[1] || fallbackPositions[1],
          entityType: initializeWithHealth(playerUnitTypes, "cavalry"),
        },
        {
          id: "infantry-1",
          position: playerPositions[2] || fallbackPositions[2],
          entityType: initializeWithHealth(playerUnitTypes, "infantry"),
        },
        {
          id: "mage-1",
          position: playerPositions[3] || fallbackPositions[3],
          entityType: initializeWithHealth(playerUnitTypes, "mage"),
        },
      ];

      setPlayerEntities(newPlayerEntities);
      setCurrentTurn(1);
      
      // Get all occupied positions to avoid overlap
      const occupiedPositions = [...playerPositions];
      
      // Get enemy positions based on the enemy placement strategy
      const enemyPositions = getEnemyPositions(
        allGridPositions,
        newTerrainMap,
        playerPositions,
        4, // We want 4 positions for our enemy entities
        enemyStrategy,
        occupiedPositions // Avoid player positions
      );
      
      // Fallback to random positions if needed
      const getRandomValidPosition = () => {
        const unoccupiedPositions = allGridPositions
          .filter((pos) => {
            const posKey = `${pos.q},${pos.r}`;
            const terrain = newTerrainMap.get(posKey);
            return terrain && terrain.type !== "water" && 
                   !occupiedPositions.some(occupied => 
                     occupied.q === pos.q && occupied.r === pos.r
                   );
          })
          .sort(() => Math.random() - 0.5);
          
        // Add the selected position to occupied list
        const position = unoccupiedPositions[0];
        if (position) occupiedPositions.push(position);
        return position || { q: 5, r: -5 }; // Last resort fallback
      };

      // Create the enemy entities
      const newEnemyEntities: EnemyEntity[] = [
        {
          id: "clobbin-1",
          position: enemyPositions[0] || getRandomValidPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "clobbin"),
          isEnemy: true,
        },
        {
          id: "spuddle-1",
          position: enemyPositions[1] || getRandomValidPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "spuddle"),
          isEnemy: true,
        },
        {
          id: "skritcher-1",
          position: enemyPositions[2] || getRandomValidPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "skritcher"),
          isEnemy: true,
        },
        {
          id: "whumble-1",
          position: enemyPositions[3] || getRandomValidPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "whumble"),
          isEnemy: true,
        },
      ];

      setEnemyEntities(newEnemyEntities);

      // Save the initial game state
      saveGameState({
        terrainMap: terrainMapToArray(newTerrainMap),
        playerEntities: newPlayerEntities,
        enemyEntities: newEnemyEntities,
        currentTurn: 1,
        gameStartedAt: Date.now(),
        lastSavedAt: Date.now(),
      });
    }
  }, [allGridPositions, setTerrainMap, setPlayerEntities, setEnemyEntities, setCurrentTurn, getPlayerPositions, getEnemyPositions]);
  
  // Function to randomly select a placement strategy
  const getRandomStrategy = (): PlacementStrategy => {
    const strategies: PlacementStrategy[] = ["center", "corners", "edges", "spread", "random"];
    return strategies[Math.floor(Math.random() * strategies.length)];
  };
  
  // Function to randomly select an enemy placement strategy
  const getRandomEnemyStrategy = (): EnemyPlacementStrategy => {
    const strategies: EnemyPlacementStrategy[] = ["opposite", "surrounding", "far", "random"];
    return strategies[Math.floor(Math.random() * strategies.length)];
  };
  
  // Handle reset button click
  const handleReset = useCallback(() => {
    // Clear all game state
    clearGameState();

    // Reset all React state
    setTerrainMap(new Map());
    setPlayerEntities([]);
    setEnemyEntities([]);
    setPendingMoves(new Map());
    setSelectedEntity(null);
    setMovementRangeHexagons([]);
    setIsSelectingDestination(false);
    setCurrentTurn(1);

    // Small delay to ensure the UI clears before generating a new game
    setTimeout(() => {
      // Use random strategies for variety when clicking reset
      initializeNewGame(getRandomStrategy(), getRandomEnemyStrategy());
    }, 50);
  }, [
    initializeNewGame,
    setTerrainMap,
    setPlayerEntities,
    setEnemyEntities,
    setPendingMoves,
    setSelectedEntity,
    setMovementRangeHexagons,
    setIsSelectingDestination,
    setCurrentTurn,
  ]);

  // Load saved game or initialize a new one
  useEffect(() => {
    if (allGridPositions.length > 0) {
      const savedState = loadGameState();

      if (savedState) {
        // Restore from saved state
        try {
          const restoredTerrainMap = arrayToTerrainMap(savedState.terrainMap);
          setTerrainMap(restoredTerrainMap);
          setPlayerEntities(savedState.playerEntities);
          setEnemyEntities(savedState.enemyEntities || []); // Handle older saves that might not have enemies
          setCurrentTurn(savedState.currentTurn);
          console.log("Game state loaded from save", savedState.lastSavedAt);
        } catch (error) {
          console.error("Error restoring saved game:", error);
          initializeNewGame(); // Fall back to new game if restoration fails
        }
      } else {
        // No saved game, start a new one
        initializeNewGame("center", "far");
      }
    }
  }, [
    allGridPositions,
    initializeNewGame,
    setTerrainMap,
    setPlayerEntities,
    setEnemyEntities,
    setCurrentTurn,
  ]);

  // Save game state whenever critical parts change
  const saveGame = useCallback(
    (
      terrainMap: Map<string, TerrainDefinition>,
      playerEntities: PlayerEntity[],
      enemyEntities: EnemyEntity[],
      currentTurn: number
    ) => {
      // Ensure the game has initialized and terrainMap is not empty
      if (terrainMap.size > 0 && playerEntities.length > 0) {
        const currentGameState = loadGameState(); // Load to preserve gameStartedAt if it exists
        saveGameState({
          terrainMap: terrainMapToArray(terrainMap),
          playerEntities: playerEntities,
          enemyEntities: enemyEntities,
          currentTurn: currentTurn,
          gameStartedAt: currentGameState?.gameStartedAt || Date.now(), // Preserve original start time
          lastSavedAt: Date.now(),
        });
      }
    },
    []
  );

  // Function to initialize game with specific map configuration
  const initializeWithConfig = useCallback((config: {
    playerPlacement?: PlacementStrategy;
    enemyPlacement?: EnemyPlacementStrategy;
    // Additional config options can be added here for terrain presets, etc.
  }) => {
    const { playerPlacement = "center", enemyPlacement = "far" } = config;
    
    // Reset game state
    setTerrainMap(new Map());
    setPlayerEntities([]);
    setEnemyEntities([]);
    setPendingMoves(new Map());
    setSelectedEntity(null);
    setMovementRangeHexagons([]);
    setIsSelectingDestination(false);
    setCurrentTurn(1);
    
    // Small delay to ensure UI updates before initializing
    setTimeout(() => {
      initializeNewGame(playerPlacement, enemyPlacement);
    }, 50);
  }, [
    initializeNewGame,
    setTerrainMap,
    setPlayerEntities,
    setEnemyEntities,
    setPendingMoves,
    setSelectedEntity,
    setMovementRangeHexagons,
    setIsSelectingDestination,
    setCurrentTurn,
  ]);
  
  // Helper function to load game state
  const loadGame = useCallback(() => {
    const savedState = loadGameState();
    if (savedState) {
      try {
        const restoredTerrainMap = arrayToTerrainMap(savedState.terrainMap);
        setTerrainMap(restoredTerrainMap);
        setPlayerEntities(savedState.playerEntities);
        setEnemyEntities(savedState.enemyEntities || []); // Handle older saves
        setCurrentTurn(savedState.currentTurn);
        return true;
      } catch (error) {
        console.error("Error loading saved game:", error);
        return false;
      }
    }
    return false;
  }, [setTerrainMap, setPlayerEntities, setEnemyEntities, setCurrentTurn]);

  return {
    initializeNewGame,
    handleReset,
    saveGame,
    loadGame,
    initializeWithConfig,
    getRandomStrategy,
    getRandomEnemyStrategy
  };
};

export default useGameInitialization;
