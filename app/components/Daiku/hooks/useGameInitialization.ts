import { useCallback, useEffect } from 'react';
import { GridPosition, TerrainDefinition, PlayerEntity, EnemyEntity } from '../utils/types';
import { generateTerrainMap } from '../utils/generateTerrainMap';
import { getNeighboringTiles } from '../utils/getNeigboringTiles';
import { playerUnitTypes, enemyUnitTypes } from '../utils/entityTypes';
import { saveGameState, loadGameState, clearGameState, terrainMapToArray, arrayToTerrainMap } from '../utils/gameState';

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
  // Initialize a new game
  const initializeNewGame = useCallback(() => {
    console.log("initializeNewGame");
    if (allGridPositions.length > 0) {
      const newTerrainMap = generateTerrainMap(allGridPositions);
      setTerrainMap(newTerrainMap);

      // Find suitable starting positions for entities (non-water terrain near center)
      const centerPos = { q: 0, r: 0 };
      const potentialStartPositions = [
        centerPos,
        ...getNeighboringTiles(centerPos).filter((pos) => {
          const posKey = `${pos.q},${pos.r}`;
          const terrain = newTerrainMap.get(posKey);
          return terrain && terrain.type !== "water";
        }),
      ];

      // Shuffle the positions to randomize placement
      const shuffledPositions = [...potentialStartPositions].sort(() => Math.random() - 0.5);

      // Helper function to initialize entity with random health within its range
      const initializeWithHealth = (unitType: any, key: string) => {
        const baseType = { ...unitType[key] };

        if (baseType.minHealth !== undefined && baseType.maxHealth !== undefined) {
          // Set the current health to a random value between minHealth and maxHealth (inclusive)
          const randomHealth =
            Math.floor(Math.random() * (baseType.maxHealth - baseType.minHealth + 1)) +
            baseType.minHealth;
          return {
            ...baseType,
            currentHealth: randomHealth,
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

      // Create the entities at the shuffled positions - one of each type for easier debugging
      const newPlayerEntities: PlayerEntity[] = [
        {
          id: "archer-1",
          position: shuffledPositions[0],
          entityType: initializeWithHealth(playerUnitTypes, "archer"),
        },
        {
          id: "cavalry-1",
          position: shuffledPositions[1],
          entityType: initializeWithHealth(playerUnitTypes, "cavalry"),
        },
        {
          id: "infantry-1",
          position: shuffledPositions[2],
          entityType: initializeWithHealth(playerUnitTypes, "infantry"),
        },
        {
          id: "mage-1",
          position: shuffledPositions[3] || { q: 1, r: -1 }, // Fallback position if not enough shuffled positions
          entityType: initializeWithHealth(playerUnitTypes, "mage"),
        },
      ];

      setPlayerEntities(newPlayerEntities);
      setCurrentTurn(1);

      const getEnemyPosition = () => {
        return allGridPositions
          .filter((pos) => {
            // Find positions at the far end of the map
            const distance = Math.abs(pos.q) + Math.abs(pos.r);
            const posKey = `${pos.q},${pos.r}`;
            const terrain = newTerrainMap.get(posKey);
            // Choose non-water terrain that's far from the center
            return distance > 4 && terrain && terrain.type !== "water";
          })
          .sort(() => Math.random() - 0.5)[0]; // Pick a random position from candidates
      };

      const newEnemyEntities: EnemyEntity[] = [
        {
          id: "clobbin-1",
          position: getEnemyPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "clobbin"),
          isEnemy: true,
        },
        {
          id: "spuddle-1",
          position: getEnemyPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "spuddle"),
          isEnemy: true,
        },
        {
          id: "skritcher-1",
          position: getEnemyPosition(),
          entityType: initializeWithHealth(enemyUnitTypes, "skritcher"),
          isEnemy: true,
        },
        {
          id: "whumble-1",
          position: getEnemyPosition(),
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
  }, [allGridPositions, setTerrainMap, setPlayerEntities, setEnemyEntities, setCurrentTurn]);

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
      initializeNewGame();
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
        initializeNewGame();
      }
    }
  }, [allGridPositions, initializeNewGame, setTerrainMap, setPlayerEntities, setEnemyEntities, setCurrentTurn]);

  // Save game state whenever critical parts change
  const saveGame = useCallback((terrainMap: Map<string, TerrainDefinition>, playerEntities: PlayerEntity[], enemyEntities: EnemyEntity[], currentTurn: number) => {
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
  }, []);

  return {
    initializeNewGame,
    handleReset,
    saveGame
  };
};

export default useGameInitialization;
