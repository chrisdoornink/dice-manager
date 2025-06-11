"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Fade } from "@mui/material";
import {
  GridPosition,
  TerrainDefinition,
  PlayerEntity,
  EnemyEntity,
  GameEntity,
  HexagonData,
  TerrainType,
} from "./utils/types";
import Entity from "./components/Entity";
import { executeCombat } from "./utils/combatUtils";
import { calculateMovementRange } from "./utils/calculateMovementRange";
import { getNeighboringTiles } from "./utils/getNeigboringTiles";
import { generateHexPoints } from "./utils/hexMath";
import { TERRAIN_TYPES } from "./utils/generateTerrainMap";
import { playerUnitTypes, enemyUnitTypes } from "./utils/entityTypes";
import SpriteDebugModal from "./components/SpriteDebugModal";
import HealthDebugModal from "./components/HealthDebugModal";
import Button from "@mui/material/Button";
import CombatLogOverlay from "./components/CombatLogOverlay";
import useCombatLog from "./hooks/useCombatLog";

// Import extracted component files
import HeaderSection from "./components/HeaderSection";
import FooterSection from "./components/FooterSection";
import HexagonGrid from "./components/HexagonGrid";
// Using FooterSection instead of ControlPanel

// Import our custom hooks
import useWindowDimensions from "./hooks/useWindowDimensions";
import { useHexagonSize } from "./hooks/useHexagonSize";
import useTerrainMap from "./hooks/useTerrainMap";
import useHexagonHighlight from "./hooks/useHexagonHighlight";
import useEntitySelection from "./hooks/useEntitySelection";
import useEntityManagement from "./hooks/useEntityManagement";
import useMoveManagement from "./hooks/useMoveManagement";
import useEnemyTurn from "./hooks/useEnemyTurn";
import useTurnManagement from "./hooks/useTurnManagement";
import useModals from "./hooks/useModals";
import useGridInitialization from "./hooks/useGridInitialization";
import useGameInitialization from "./hooks/useGameInitialization";
import useGameVisuals from "./hooks/useGameVisuals";
import useTileSelection from "./hooks/useTileSelection";
import useEnemyAI from "./hooks/useEnemyAI";

// Import utility functions
import { generateTerrainMap } from "./utils/generateTerrainMap";
import { saveGameState, loadGameState, clearGameState } from "./utils/gameState";

// Custom cursor styles for each unit type
const customCursors = {
  archer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23F44336' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E🏹%3C/text%3E%3C/svg%3E") 16 16, auto`,
  cavalry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232196F3' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E🐎%3C/text%3E%3C/svg%3E") 16 16, auto`,
  infantry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234CAF50' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E⚔️%3C/text%3E%3C/svg%3E") 16 16, auto`,
};

export const useCombatPhase = () => {
  const [isCombatPhase, setIsCombatPhase] = useState(false);

  return { isCombatPhase, setIsCombatPhase };
};

const MainPage = () => {
  // Get window dimensions using our custom hook
  const windowDimensions = useWindowDimensions();

  // take into account the 10% header and 10% footer
  const calculatedWindowDimensions = {
    width: windowDimensions.width * 0.8,
    height: windowDimensions.height * 0.8,
  };

  // Get hexagon size using the hexagon size hook
  const [hexSize, hexWidth, hexHeight] = useHexagonSize({
    windowDimensions: calculatedWindowDimensions,
  });

  // Get grid positions
  const { allGridPositions } = useGridInitialization();

  // Use terrain map hook
  const { terrainMap, setTerrainMap } = useTerrainMap(allGridPositions);

  // Use entity management hook
  const { playerEntities, setPlayerEntities, enemyEntities, setEnemyEntities } =
    useEntityManagement();

  // Use entity selection hook
  const {
    selectedEntity,
    setSelectedEntity,
    movementRangeHexagons,
    setMovementRangeHexagons,
    isSelectingDestination,
    setIsSelectingDestination,
  } = useEntitySelection();

  // Use hexagon highlight hook
  const { highlightedNeighbors, setHighlightedNeighbors, hoveredHexagon, setHoveredHexagon } =
    useHexagonHighlight();

  // Use move management hook
  const {
    pendingMoves,
    setPendingMoves,
    errorMessage,
    setErrorMessage,
    errorMessageTimeout,
    setErrorMessageTimeout,
    showError,
  } = useMoveManagement();

  // Use enemy turn hook
  const { isEnemyTurn, setIsEnemyTurn, enemyPendingMoves, setEnemyPendingMoves } = useEnemyTurn();
  const { isCombatPhase, setIsCombatPhase } = useCombatPhase();

  // Use combat log hook
  const { logEntries, addLogEntry, clearLog } = useCombatLog(10);

  // Access the enemy AI hook
  const { calculateEnemyMoves } = useEnemyAI();

  // Use turn management hook
  const { currentTurn, setCurrentTurn } = useTurnManagement();

  // Use modals hook
  const {
    isSpriteDebugModalOpen,
    setIsSpriteDebugModalOpen,
    isHealthDebugModalOpen,
    setIsHealthDebugModalOpen,
  } = useModals();

  // Track if the grid has been initialized and animated once
  const [gridInitialized, setGridInitialized] = useState(false);

  // Use game initialization hook - must be before the save game effect
  const { initializeNewGame, handleReset, saveGame } = useGameInitialization({
    allGridPositions,
    setTerrainMap,
    setPlayerEntities,
    setEnemyEntities,
    setCurrentTurn,
    setPendingMoves,
    setSelectedEntity,
    setMovementRangeHexagons,
    setIsSelectingDestination,
  });

  // Use tile selection hook - must be after all other state hooks are defined
  const { handleTileSelection } = useTileSelection({
    playerEntities,
    enemyEntities,
    pendingMoves,
    selectedEntity,
    movementRangeHexagons,
    setErrorMessage,
    setPendingMoves,
    setSelectedEntity,
    setIsSelectingDestination,
  });

  // Save game state whenever critical parts change
  useEffect(() => {
    // Ensure the game has initialized and terrainMap is not empty
    if (terrainMap.size > 0 && playerEntities.length > 0) {
      saveGame(terrainMap, playerEntities, enemyEntities, currentTurn);
    }
  }, [playerEntities, enemyEntities, currentTurn, terrainMap, saveGame]);

  // TODO: Replace with actual enemy data
  const enemiesForDebug: EnemyEntity[] = [
    // Example enemy, replace with actual data from your game state
    // { id: 'enemy1', type: 'Goblin', icon: 'G', currentHealth: 30, maxHealth: 30, attack: '5-10', q: 1, r: 1, initiative: 10 },
  ];

  // Use game visuals hook
  const { visibleHexagons } = useGameVisuals({
    allGridPositions,
    terrainMap,
    gridInitialized,
    setGridInitialized,
  });

  const hexagonPoints = generateHexPoints();

  // Helper function to determine the fill color based on hexagon state

  // Execute all pending moves and advance turn
  const executeMoves = () => {
    if (pendingMoves.size === 0 && !isEnemyTurn) return;

    // Player turn - apply all pending moves to player entities
    const updatedPlayerEntities = playerEntities.map((entity) => {
      const pendingMove = pendingMoves.get(entity.id);
      if (pendingMove) {
        return {
          ...entity,
          position: pendingMove,
        };
      }
      return entity;
    });

    // Update player entities and clear pending moves
    setPlayerEntities(updatedPlayerEntities);
    setPendingMoves(new Map());

    // Start enemy turn
    setIsEnemyTurn(true);

    // Calculate enemy moves based on updated player positions
    // We already have terrainMap with all terrain definitions

    // Convert player entities to player positions for AI calculations
    const playerPositions = updatedPlayerEntities.map((player) => player.position);

    // Generate enemy moves using the enemy AI hook
    const enemyMoves = calculateEnemyMoves(enemyEntities, playerPositions, terrainMap);

    // Set enemy pending moves
    setEnemyPendingMoves(enemyMoves);

    // Allow a delay to show it's the enemy's turn before executing their moves
    setTimeout(() => {
      // Execute enemy moves
      const updatedEnemyEntities = enemyEntities.map((entity) => {
        // Check if there's a pending move for this entity
        if (entity.id && enemyMoves.has(entity.id)) {
          const enemyMove = enemyMoves.get(entity.id);
          if (enemyMove) {
            return {
              ...entity,
              position: enemyMove,
            };
          }
        }
        return entity;
      });

      // Update enemy entities
      setEnemyEntities(updatedEnemyEntities);
      setEnemyPendingMoves(new Map());

      // End enemy turn, back to player turn
      setIsEnemyTurn(false);
      setIsCombatPhase(true);

      // Execute combat using imported utility function
      executeCombat(
        updatedEnemyEntities,
        updatedPlayerEntities,
        terrainMap,
        (enemyEntities: EnemyEntity[], playerEntities: PlayerEntity[]) => {
          // Update entities with new health values
          setEnemyEntities(enemyEntities);
          setPlayerEntities(playerEntities);

          // End combat phase
          setIsCombatPhase(false);
        },
        addLogEntry
      );
    }, 1500); // 1.5 second delay for visual feedback

    // Clear combat log when a new combat phase starts
    clearLog();
  };

  // Helper function to calculate distance between hex coordinates
  const calculateHexDistance = (a: GridPosition, b: GridPosition): number => {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  };

  // Helper function to check if an entity is at a specific position
  const isEntityAtPosition = (entityPosition: GridPosition, position: GridPosition): boolean => {
    return entityPosition.q === position.q && entityPosition.r === position.r;
  };

  // Helper function to check if a pending move is targeting a specific position
  const isPendingMoveToPosition = (position: GridPosition): boolean => {
    return Array.from(pendingMoves.values()).some(
      (pendingPos) => pendingPos.q === position.q && pendingPos.r === position.r
    );
  };

  // Helper function to get entity at a position
  const getEntityAtPosition = (position: GridPosition): GameEntity | undefined => {
    // Check player entities first
    const playerEntity = playerEntities.find((entity) =>
      isEntityAtPosition(entity.position, position)
    );
    if (playerEntity) return playerEntity;

    // Then check enemy entities
    return enemyEntities.find((entity) => isEntityAtPosition(entity.position, position));
  };

  // Helper function to get entity with pending move to a position
  const getEntityWithPendingMoveTo = (position: GridPosition): PlayerEntity | undefined => {
    for (const entity of playerEntities) {
      const pendingMove = pendingMoves.get(entity.id);
      if (pendingMove && pendingMove.q === position.q && pendingMove.r === position.r) {
        return entity;
      }
    }
    return undefined;
  };

  // returns 140% for smaller screens, 100% for larger screens
  const getExecuteButtonWidth = (): string => {
    return window.innerWidth < 600 ? "140%" : "100%";
  };

  const getHexagonFillColor = (position: HexagonData): string => {
    // Check if hexagon is hovered
    // if (hoveredHexagon && hoveredHexagon.q === position.q && hoveredHexagon.r === position.r) {
    //   return `${position.terrain.color}80`;
    // }

    if (position.terrain.type === "water") return "#5DA9E9";

    // Check if hexagon is in movement range
    if (
      selectedEntity &&
      movementRangeHexagons.some((pos) => pos.q === position.q && pos.r === position.r)
    ) {
      // Don't highlight if another entity is already there
      const isOccupiedByOtherPlayer = playerEntities.some(
        (e) =>
          e.id !== selectedEntity.id && e.position.q === position.q && e.position.r === position.r
      );

      // Check if enemy is there
      const isOccupiedByEnemy = enemyEntities.some(
        (e) => e.position.q === position.q && e.position.r === position.r
      );

      // Check if another pending move is targeting this position
      const isTargetedByPendingMove = Array.from(pendingMoves.entries()).some(
        ([entityId, pendingPos]) =>
          entityId !== selectedEntity.id &&
          pendingPos.q === position.q &&
          pendingPos.r === position.r
      );

      // If occupied or targeted by pending move, don't highlight
      if (isOccupiedByOtherPlayer || isOccupiedByEnemy || isTargetedByPendingMove) {
        return position.terrain.color; // Return normal terrain color
      }

      // Make all terrain types lighter when highlighted in movement range
      if (position.terrain.type === "grass") return "#E5FFD4"; // Lighter shade of green for grass
      if (position.terrain.type === "forest") return "#A3D682"; // Lighter green for forest
      if (position.terrain.type === "mountain") return "#B8E6B8"; // Lighter green for mountain
      return `${position.terrain.color}80`; // 80% opacity as fallback for other terrain types
    }

    // Check if hexagon is a highlighted neighbor
    // if (highlightedNeighbors.some((n) => n.q === position.q && n.r === position.r)) {
    //   return `${position.terrain.color}80`; // Terrain color with 50% opacity for highlighted neighbors
    // }

    // Default - use terrain color
    return position.terrain.color;
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        overflow: "hidden",
        backgroundColor: "#5C4E45",
      }}
    >
      {/* Header Section */}
      <HeaderSection
        currentTurn={currentTurn}
        handleReset={handleReset}
        selectedEntity={selectedEntity}
        errorMessage={errorMessage}
      />
      {/* Main Game Board Section */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <HexagonGrid
          visibleHexagons={visibleHexagons}
          hexSize={hexSize}
          hexWidth={hexWidth}
          hexHeight={hexHeight}
          hexagonPoints={hexagonPoints}
          customCursors={customCursors}
          selectedEntity={selectedEntity}
          movementRangeHexagons={movementRangeHexagons}
          hoveredHexagon={hoveredHexagon as HexagonData | null}
          setHoveredHexagon={setHoveredHexagon}
          setHighlightedNeighbors={setHighlightedNeighbors}
          handleTileSelection={handleTileSelection}
          getEntityAtPosition={getEntityAtPosition}
          pendingMoves={pendingMoves}
          getEntityWithPendingMoveTo={getEntityWithPendingMoveTo}
          handleEntityClick={(entity) => {
            // Check if this is an enemy entity
            if (entity.isEnemy) {
              // For enemy entities, just show info (no selection/movement)
              console.log("Enemy entity clicked:", entity);
              // Clear any previous selection
              setSelectedEntity(null);
              setMovementRangeHexagons([]);
            } else {
              // For player entities, handle normal selection flow
              const playerEntity = entity as PlayerEntity;
              
              // Don't allow selecting defeated entities
              if (playerEntity.defeated) {
                console.log("This entity has been defeated and cannot be selected.");
                return;
              }

              // If already selected, deselect
              if (selectedEntity && selectedEntity.id === playerEntity.id) {
                setSelectedEntity(null);
                setMovementRangeHexagons([]);
              } else {
                // Otherwise select this entity and calculate movement range
                setSelectedEntity(playerEntity);
                const calculatedMovementRangeHexagons = calculateMovementRange(
                  playerEntity,
                  terrainMap
                );
                setMovementRangeHexagons(calculatedMovementRangeHexagons);
              }
            }
          }}
          getHexagonFillColor={getHexagonFillColor}
        />
      </Box>

      {/* Footer Section */}
      <FooterSection
        playerEntities={playerEntities}
        isEnemyTurn={isEnemyTurn}
        pendingMoves={pendingMoves}
        executeMoves={executeMoves}
        getStatusMessage={() => {
          if (isCombatPhase) {
            return "Combat";
          } else if (isEnemyTurn) {
            return "Enemy Turn";
          } else if (pendingMoves.size > 0) {
            return "Execute Moves";
          } else {
            return "Select Moves";
          }
        }}
      />

      {/* Combat Log Overlay */}
      <CombatLogOverlay logEntries={logEntries} />

      {/* Debug Buttons and Modals */}
      <Button
        variant="outlined"
        onClick={() => setIsHealthDebugModalOpen(true)}
        sx={{ mr: 1, position: "absolute", top: 80, right: 165, zIndex: 1300 }} // Adjusted positioning
      >
        Debug Health
      </Button>
      <HealthDebugModal
        open={isHealthDebugModalOpen}
        onClose={() => setIsHealthDebugModalOpen(false)}
        players={playerEntities}
        enemies={enemiesForDebug}
      />
      <SpriteDebugModal
        open={isSpriteDebugModalOpen}
        onClose={() => setIsSpriteDebugModalOpen(false)}
      />
    </Container>
  );
};

export default MainPage;
