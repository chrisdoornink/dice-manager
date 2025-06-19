"use client";

import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Slider, Fade } from "@mui/material";
import { GridPosition, PlayerEntity, EnemyEntity, GameEntity, HexagonData } from "./utils/types";
import { executeCombat } from "./utils/combatUtils/executeCombat";
import { calculateMovementRange } from "./utils/calculateMovementRange";
import { generateHexPoints } from "./utils/hexMath";
import CombatLogOverlay from "./components/CombatLogOverlay";
import useCombatLog from "./hooks/useCombatLog";

// Import extracted component files
import HeaderSection from "./components/HeaderSection";
import FooterSection from "./components/FooterSection";
import HexagonGrid from "./components/HexagonGrid";
import GameOverModal from "./components/GameOverModal";
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
import usePerspectiveEffect from "./hooks/usePerspectiveEffect";

// Custom cursor styles for each unit type
const customCursors = {
  // Increased size from 32x32 to 40x40 and adjusted hotspot from 16 to 20 for all cursors
  archer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23F44336' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='45' fill='white'%3E🏹%3C/text%3E%3C/svg%3E") 20 20, auto`,
  cavalry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%232196F3' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='45' fill='white'%3E🐎%3C/text%3E%3C/svg%3E") 20 20, auto`,
  infantry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%234CAF50' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='45' fill='white'%3E⚔️%3C/text%3E%3C/svg%3E") 20 20, auto`,
  mage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%239C27B0' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='45' fill='white'%3E🪄%3C/text%3E%3C/svg%3E") 20 20, auto`,
};

export const useCombatPhase = () => {
  const [isCombatPhase, setIsCombatPhase] = useState(false);

  return { isCombatPhase, setIsCombatPhase };
};

const MainPage = () => {
  // Use perspective effect hook for 3D board effect
  const { sliderValue, perspectiveValue, handlePerspectiveChange } = usePerspectiveEffect();

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
  const { pendingMoves, setPendingMoves, errorMessage, setErrorMessage, errorMessageTimeout } =
    useMoveManagement();

  // Use enemy turn hook
  const { isEnemyTurn, setIsEnemyTurn, enemyPendingMoves, setEnemyPendingMoves } = useEnemyTurn();
  const { isCombatPhase, setIsCombatPhase } = useCombatPhase();

  // Setup combat log with new toggle functionality
  const { logEntries, addLogEntry, clearLog, isLogOpen, toggleLogVisibility } = useCombatLog();

  // Access the enemy AI hook
  const { calculateEnemyMoves } = useEnemyAI();

  // Use turn management hook
  const { currentTurn, setCurrentTurn } = useTurnManagement();

  // Track if the grid has been initialized and animated once
  const [gridInitialized, setGridInitialized] = useState(false);

  // Use game initialization hook - must be before the save game effect
  const {
    initializeNewGame,
    saveGame,
    loadGame,
    initializeWithConfig,
    getRandomStrategy,
    getRandomEnemyStrategy,
  } = useGameInitialization({
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

  // Use modals hook
  const {
    isSpriteDebugModalOpen,
    setIsSpriteDebugModalOpen,
    isHealthDebugModalOpen,
    setIsHealthDebugModalOpen,
    isGameOverModalOpen,
    setIsGameOverModalOpen,
    gameOverMessage,
    setGameOverMessage,
  } = useModals();

  // Save game state whenever critical parts change
  useEffect(() => {
    // Ensure the game has initialized and terrainMap is not empty
    if (terrainMap.size > 0 && playerEntities.length > 0) {
      saveGame(terrainMap, playerEntities, enemyEntities, currentTurn);
    }
  }, [playerEntities, enemyEntities, currentTurn, terrainMap, saveGame]);

  // Check for game over state
  useEffect(() => {
    // Check if all player entities are defeated
    const allPlayersDefeated =
      playerEntities.length > 0 && playerEntities.every((player) => player.defeated);

    // Check if all enemy entities are defeated
    const allEnemiesDefeated =
      enemyEntities.length > 0 && enemyEntities.every((enemy) => enemy.defeated);

    // Show game over modal if either condition is met
    if (allPlayersDefeated) {
      setGameOverMessage("All your units have been defeated! The enemy is victorious.");
      setIsGameOverModalOpen(true);
    } else if (allEnemiesDefeated) {
      setGameOverMessage("You have defeated all enemy units! Victory is yours!");
      setIsGameOverModalOpen(true);
    }
  }, [playerEntities, enemyEntities, setGameOverMessage, setIsGameOverModalOpen]);

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
    // setting allowMoveOntoDefeatedEntities to true allows enemies to move onto defeated entities
    const enemyMoves = calculateEnemyMoves(enemyEntities, playerPositions, terrainMap, true);

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
          setCurrentTurn(currentTurn + 1);
        },
        addLogEntry,
        currentTurn
      );
    }, 1500); // 1.5 second delay for visual feedback
  };

  // Helper function to check if an entity is at a specific position
  const isEntityAtPosition = (entityPosition: GridPosition, position: GridPosition): boolean => {
    return entityPosition.q === position.q && entityPosition.r === position.r;
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
      // Don't highlight if another non-defeated entity is already there
      const isOccupiedByOtherPlayer = playerEntities.some(
        (e) =>
          e.id !== selectedEntity.id &&
          e.position.q === position.q &&
          e.position.r === position.r &&
          !e.defeated // Only consider non-defeated entities as occupying the space
      );

      // Check if non-defeated enemy is there
      const isOccupiedByEnemy = enemyEntities.some(
        (e) => e.position.q === position.q && e.position.r === position.r && !e.defeated // Only consider non-defeated enemies as occupying the space
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

    // Default - use terrain color
    return position.terrain.color;
  };

  // Extended reset game state to also close game over modal
  const handleReset = () => {
    // Reset game state using the initialization logic with random placement strategies
    initializeNewGame(getRandomStrategy(), getRandomEnemyStrategy());
    // Also close the game over modal
    setIsGameOverModalOpen(false);
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
        backgroundColor: "#3C4325",
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
        {/* Perspective slider */}
        <Box
          sx={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            height: "300px",
            width: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "15px",
            padding: "5px 0",
          }}
        >
          <Slider
            orientation="vertical"
            value={sliderValue}
            onChange={handlePerspectiveChange}
            min={0}
            max={100}
            sx={{
              height: "280px",
              width: "8px",
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
                backgroundColor: "#fff",
              },
              "& .MuiSlider-track": {
                backgroundColor: "#fff",
              },
              "& .MuiSlider-rail": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          />
        </Box>
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
          perspectiveValue={perspectiveValue}
          pendingMoves={pendingMoves}
          getEntityWithPendingMoveTo={getEntityWithPendingMoveTo}
          handleEntityClick={(entity) => {
            // Check if this is an enemy entity
            if (entity.isEnemy) {
              // For enemy entities, dont do anything for now except,
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
      <CombatLogOverlay logEntries={logEntries} isOpen={isLogOpen} onToggle={toggleLogVisibility} />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        message={gameOverMessage}
        onClose={() => setIsGameOverModalOpen(false)}
        onReset={handleReset}
        playerEntities={playerEntities}
        enemyEntities={enemyEntities}
        currentTurn={currentTurn}
      />
    </Container>
  );
};

export default MainPage;
