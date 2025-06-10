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
} from "./utils/types";
import { EntityInfoPanel } from "./components/EntityInfoPanel";
import Entity from "./components/Entity";
import { calculateMovementRange } from "./utils/calculateMovementRange";
import { getNeighboringTiles } from "./utils/getNeigboringTiles";
import { generateHexPoints } from "./utils/hexMath";
import { TERRAIN_TYPES } from "./utils/generateTerrainMap";
import { playerUnitTypes, enemyUnitTypes } from "./utils/entityTypes";
import { ResetButton } from "./components/ResetButton";
import SpriteDebugModal from './components/SpriteDebugModal';
import HealthDebugModal from './components/HealthDebugModal';
import PlayerStatusFooter from "./components/PlayerStatusFooter";
import PixelatedButton from "./components/PixelatedButton";
import Button from '@mui/material/Button';

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
  const {
    playerEntities,
    setPlayerEntities,
    enemyEntities,
    setEnemyEntities
  } = useEntityManagement();
  
  // Use entity selection hook
  const {
    selectedEntity,
    setSelectedEntity,
    movementRangeHexagons,
    setMovementRangeHexagons,
    isSelectingDestination,
    setIsSelectingDestination
  } = useEntitySelection();
  
  // Use hexagon highlight hook
  const {
    highlightedNeighbors,
    setHighlightedNeighbors,
    hoveredHexagon,
    setHoveredHexagon
  } = useHexagonHighlight();
  
  // Use move management hook
  const {
    pendingMoves,
    setPendingMoves,
    errorMessage,
    setErrorMessage,
    errorMessageTimeout,
    setErrorMessageTimeout,
    showError
  } = useMoveManagement();
  
  // Use enemy turn hook
  const {
    isEnemyTurn,
    setIsEnemyTurn,
    enemyPendingMoves,
    setEnemyPendingMoves
  } = useEnemyTurn();
  
  // Access the enemy AI hook
  const { calculateEnemyMoves } = useEnemyAI();
  
  // Use turn management hook
  const { currentTurn, setCurrentTurn } = useTurnManagement();
  
  // Use modals hook
  const {
    isSpriteDebugModalOpen,
    setIsSpriteDebugModalOpen,
    isHealthDebugModalOpen,
    setIsHealthDebugModalOpen
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
    setIsSelectingDestination
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
    setIsSelectingDestination
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
    setGridInitialized
  });

  const hexagonPoints = generateHexPoints();

  // Helper function to determine the fill color based on hexagon state

  // Execute all pending moves and advance turn
  const executeMoves = () => {
    if (pendingMoves.size === 0 && !isEnemyTurn) return;

    if (!isEnemyTurn) {
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
          const enemyMove = enemyMoves.get(entity.id);
          if (enemyMove) {
            return {
              ...entity,
              position: enemyMove,
            };
          }
          return entity;
        });

        // Update enemy entities
        setEnemyEntities(updatedEnemyEntities);
        setEnemyPendingMoves(new Map());

        // End enemy turn, back to player turn
        setIsEnemyTurn(false);

        // Advance to next turn
        setCurrentTurn(currentTurn + 1);
      }, 1500); // 1.5 second delay for visual feedback
    } else {
      // This case is unlikely to happen as we handle enemy moves within the player turn
      // but it's here for completeness
      const updatedEnemyEntities = enemyEntities.map((entity) => {
        const enemyMove = enemyPendingMoves.get(entity.id);
        if (enemyMove) {
          return {
            ...entity,
            position: enemyMove,
          };
        }
        return entity;
      });

      setEnemyEntities(updatedEnemyEntities);
      setEnemyPendingMoves(new Map());
      setIsEnemyTurn(false);

      // Advance to next turn
      setCurrentTurn(currentTurn + 1);
    }
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
      {/* Header Section - 80px height */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Turn indicator moved to left side */}
        {/* Left side - Turn indicator */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Turn indicator */}
          <Box
            sx={{
              marginLeft: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              padding: "5px 10px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Turn: {currentTurn}
          </Box>
        </Box>

        {/* Center - Reset and Debug buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <ResetButton onReset={handleReset} />

          {/* Sprite Debug Button - only for development */}
          {/* <button
            onClick={() => setSpriteDebugModalOpen(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#FF6B00",
              color: "white",
              border: "2px solid #FF4500",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Debug Sprites
          </button> */}
        </Box>

        {/* Right side - Entity Info Panel */}
        <Box sx={{ marginRight: "20px" }}>
          <EntityInfoPanel selectedEntity={selectedEntity} />
        </Box>

        {/* Error message display */}
        {errorMessage && (
          <Box
            sx={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#f44336",
              color: "white",
              padding: "10px 20px",
              borderRadius: "4px",
              zIndex: 1100,
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.3s",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateX(-50%) translateY(-20px)" },
                "100%": { opacity: 1, transform: "translateX(-50%) translateY(0)" },
              },
            }}
          >
            {errorMessage}
          </Box>
        )}
      </Box>
      {/* Main Game Board Section */}
      <Box
        data-testid="the-board"
        sx={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 160px)", // Middle portion, leaving 80px for header and footer
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          boxSizing: "border-box",
        }}
      >
        {/* Entity info panel moved to header */}

        {/* Render all visible hexagons */}
        {visibleHexagons.map((position, index) => {
          // Convert axial coordinates to pixel coordinates for flat-topped hexagons
          // Formula for flat-top hexagons in axial coordinates
          // The spacing factor controls how close hexagons are packed
          // Lower values = tighter packing (but don't go below 1.5 for horizontal)
          const horizontalSpacingFactor = 1.5; // Standard is 1.5 for perfect hexagonal packing
          const verticalSpacingFactor = Math.sqrt(3); // Standard is sqrt(3) for perfect packing

          const xPosition = hexSize * (horizontalSpacingFactor * position.q);
          const yPosition =
            hexSize *
            ((verticalSpacingFactor / 2) * position.q + verticalSpacingFactor * position.r);

          // Invert y-position to make positive r go upward
          const yPositionInverted = -yPosition;

          return (
            <Fade key={`${position.q}-${position.r}-${index}`} in={true} timeout={200}>
              <Box
                data-testid="the-hexagon"
                sx={{
                  position: "absolute",
                  left: `calc(50% + ${xPosition}px)`,
                  top: `calc(50% + ${yPositionInverted}px)`,
                  transform: "translate(-50%, -50%)",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  cursor:
                    selectedEntity &&
                    movementRangeHexagons.some(
                      (pos) => pos.q === position.q && pos.r === position.r
                    )
                      ? selectedEntity.entityType.type === "archer"
                        ? customCursors.archer
                        : selectedEntity.entityType.type === "cavalry"
                        ? customCursors.cavalry
                        : selectedEntity.entityType.type === "infantry"
                        ? customCursors.infantry
                        : "crosshair"
                      : "pointer", // Custom cursor based on unit type for valid movement targets
                }}
                onClick={() => {
                  // Only handle tile clicks if we have a selected entity and this tile is in movement range
                  if (
                    selectedEntity &&
                    movementRangeHexagons.some(
                      (pos) => pos.q === position.q && pos.r === position.r
                    )
                  ) {
                    handleTileSelection(position);
                  }
                }}
                onMouseEnter={() => {
                  setHoveredHexagon(position);
                  setHighlightedNeighbors(getNeighboringTiles(position));
                }}
                onMouseLeave={() => {
                  setHoveredHexagon(null);
                  setHighlightedNeighbors([]);
                }}
              >
                <svg
                  width={hexWidth}
                  height={hexHeight}
                  viewBox="0 0 100 100"
                  style={{ display: "block" }} // Remove any default spacing
                >
                  <defs>
                    <clipPath id={`hexClip-${position.q}-${position.r}`}>
                      <polygon points={hexagonPoints} />
                    </clipPath>
                  </defs>

                  {/* For water and grass tiles, add the image as a repeating pattern */}
                  {(position.terrain.type === "water" || position.terrain.type === "grass") &&
                    position.terrain.backgroundImage && (
                      <>
                        <defs>
                          <pattern
                            id={`terrain-pattern-${position.q}-${position.r}`}
                            patternUnits="userSpaceOnUse"
                            width="50"
                            height="50"
                            patternTransform="scale(1.5)"
                          >
                            <image
                              href={position.terrain.backgroundImage}
                              x="0"
                              y="0"
                              width="50"
                              height="50"
                              preserveAspectRatio="xMidYMid slice"
                            />
                          </pattern>
                        </defs>
                        <polygon
                          points={hexagonPoints}
                          fill={`url(#terrain-pattern-${position.q}-${position.r})`}
                          fillOpacity={
                            position.terrain.patternOpacity !== undefined
                              ? position.terrain.patternOpacity
                              : 1
                          }
                          clipPath={`url(#hexClip-${position.q}-${position.r})`}
                        />
                      </>
                    )}

                  {/* Define the hexagon shape with a stroke */}
                  <polygon
                    points={hexagonPoints}
                    fill={getHexagonFillColor(position)}
                    fillOpacity={
                      position.terrain.type === "water" || position.terrain.type === "grass"
                        ? "0.6"
                        : "1"
                    }
                    strokeWidth="3"
                    stroke="#374d22"
                  />

                  {/* Render forest sprites from sprite sheet - simpler method */}
                  {position.terrain.spriteSheetSprite && (
                    <foreignObject
                      x="5"
                      y="5"
                      width="90"
                      height="90"
                      clipPath={`url(#hexClip-${position.q}-${position.r})`}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${position.terrain.spriteSheetSprite.spritesheet})`,
                          backgroundPosition: position.terrain.spriteSheetSprite.singleImage
                            ? `center center`
                            : `-${position.terrain.spriteSheetSprite.x / 3}px -${
                                position.terrain.spriteSheetSprite.y / 3
                              }px`,
                          backgroundSize: position.terrain.spriteSheetSprite.singleImage
                            ? "cover"
                            : "342px 342px",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    </foreignObject>
                  )}

                  {/* Coordinate text removed - not needed for gameplay */}

                  {/* Entity display that scales with the hexagon */}
                  <g
                    transform={`scale(${hexSize / 60})`}
                    style={{ transformOrigin: "50px 60px" }}
                    onClick={(e) => {
                      // Get entity at this position
                      const entity = getEntityAtPosition(position);

                      // Only handle clicks if there's an entity here
                      if (entity) {
                        e.stopPropagation(); // Prevent triggering hexagon click

                        // Check if this is an enemy entity
                        if ("isEnemy" in entity && entity.isEnemy === true) {
                          // For enemy entities, just show info (no selection/movement)
                          console.log("Enemy entity clicked:", entity);
                          // Clear any previous selection
                          setSelectedEntity(null);
                          setMovementRangeHexagons([]);
                        } else {
                          // For player entities, handle normal selection flow
                          const playerEntity = entity as PlayerEntity;

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
                      }
                    }}
                  >
                    {/* Rendering entities is now done separately, not using position.entity */}

                    {/* Render entity at this position */}
                    {(() => {
                      // Get entity at this position (if any)
                      const entity = getEntityAtPosition(position);

                      // Always show entity at its original position, even if it has a pending move
                      if (entity) {
                        return (
                          <g key={`entity-${entity.id}`}>
                            <foreignObject x="10" y="-10" width="80" height="130">
                              <Entity
                                entity={entity}
                                isSelected={!!(selectedEntity && selectedEntity.id === entity.id)}
                                isPendingMove={pendingMoves.has(entity.id)}
                                onClick={(entity: GameEntity) => {
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

                                    // If already selected, deselect
                                    if (selectedEntity && selectedEntity.id === playerEntity.id) {
                                      setSelectedEntity(null);
                                      setMovementRangeHexagons([]);
                                    } else {
                                      // Otherwise select this entity and calculate movement range
                                      setSelectedEntity(playerEntity);
                                      const calculatedMovementRangeHexagons =
                                        calculateMovementRange(playerEntity, terrainMap);
                                      setMovementRangeHexagons(calculatedMovementRangeHexagons);
                                    }
                                  }
                                }}
                              />
                            </foreignObject>
                          </g>
                        );
                      }

                      // Show ghost preview of pending moves
                      const pendingEntity = getEntityWithPendingMoveTo(position);
                      if (pendingEntity) {
                        return (
                          <g key={`ghost-${pendingEntity.id}`}>
                            <foreignObject x="10" y="-10" width="80" height="130">
                              <Entity entity={pendingEntity} isGhost={true} isPendingMove={true} />
                            </foreignObject>
                          </g>
                        );
                      }

                      return null;
                    })()}
                  </g>
                </svg>
              </Box>
            </Fade>
          );
        })}
      </Box>

      {/* Footer Section - 80px height */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "80px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 16px", // Add padding on the sides for mobile
        }}
      >
        {/* Centered container with max width */}
        <Box
          sx={{
            margin: "0 auto",
            width: "100%",
            maxWidth: "600px", // Max width for desktop view
            display: "flex",
            justifyContent: "space-between", // Space between left and right elements
            alignItems: "center",
            // Scale down content for screens below 650px
            "@media (max-width: 650px)": {
              transform: "scale(0.85) translateX(-50px)",
              transformOrigin: "center",
              gap: "10px",
            },
            // Scale down even more for very small screens
            "@media (max-width: 480px)": {
              transform: "scale(0.75) translateX(-50px)",
              transformOrigin: "center",
              gap: "10px",
            },
          }}
        >
          {/* Left side - Player Status Footer */}
          <Box sx={{ textAlign: "left" }}>
            <PlayerStatusFooter playerEntities={playerEntities} />
          </Box>

          {/* Right side - Either Enemy Turn Notification or Execute Moves Button */}
          <Box sx={{ textAlign: "right" }}>
            {isEnemyTurn ? (
              <Box
                sx={{
                  backgroundColor: "rgba(244, 67, 54, 0.8)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.7 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.7 },
                  },
                }}
              >
                Enemy Turn
              </Box>
            ) : (
              pendingMoves.size > 0 && (
                <PixelatedButton
                  onClick={executeMoves}
                  disabled={isEnemyTurn || pendingMoves.size === 0}
                  sx={{ width: getExecuteButtonWidth(), marginBottom: "20px" }}
                >
                  Execute Moves ({pendingMoves.size})
                </PixelatedButton>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Sprite Debug Modal */}
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
        players={playerEntities} // Use playerEntities which is in scope
        enemies={enemiesForDebug} // Pass the dummy or actual enemy data here
      />
      <SpriteDebugModal
        open={isSpriteDebugModalOpen}
        onClose={() => setIsSpriteDebugModalOpen(false)}
      />
    </Container>
  );
};

export default MainPage;
