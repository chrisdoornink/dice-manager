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
import { calculateMovementRange } from "./utils/calculateMovementRange";
import { getNeighboringTiles } from "./utils/getNeigboringTiles";
import { generateHexPoints } from "./utils/hexMath";
import { useHexagonAnimation } from "./hooks/useHexagonAnimation";
import { ANIMATION_DELAY, TERRAIN_TYPES } from "./utils/generateTerrainMap";
import { generateTerrainMap } from "./utils/generateTerrainMap";
import { playerUnitTypes, enemyUnitTypes } from "./utils/entityTypes";
import { createHexagonalGrid } from "./hooks/useHexagonalGrid";
import { useHexagonSize } from "./hooks/useHexagonSize";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  terrainMapToArray,
  arrayToTerrainMap,
  GameState,
} from "./utils/gameState";
import { EnemyEntities } from "./components/EnemyEntities";
import { ResetButton } from "./components/ResetButton";

// Custom cursor styles for each unit type
const customCursors = {
  archer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23F44336' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E🏹%3C/text%3E%3C/svg%3E") 16 16, auto`,
  cavalry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232196F3' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E🐎%3C/text%3E%3C/svg%3E") 16 16, auto`,
  infantry: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234CAF50' fill-opacity='0.7'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='40' fill='white'%3E⚔️%3C/text%3E%3C/svg%3E") 16 16, auto`,
};

const MainPage = () => {
  // Responsive sizing - calculate hexagon size based on screen dimensions
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Update window dimensions when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away to get initial size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [hexSize, hexWidth, hexHeight] = useHexagonSize({
    windowDimensions,
  });

  // Pre-generate a terrain map to ensure connectivity
  const [terrainMap, setTerrainMap] = useState<Map<string, TerrainDefinition>>(new Map());

  // Track which hexagons are highlighted as neighbors
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<GridPosition[]>([]);

  // Track the currently hovered hexagon
  const [hoveredHexagon, setHoveredHexagon] = useState<GridPosition | null>(null);

  // Track selected entity for movement range display
  const [selectedEntity, setSelectedEntity] = useState<PlayerEntity | null>(null);

  // Track which hexagons are within movement range of selected entity
  const [movementRangeHexagons, setMovementRangeHexagons] = useState<GridPosition[]>([]);

  // Track if we're in tile selection mode (selecting a destination for movement/attack)
  const [isSelectingDestination, setIsSelectingDestination] = useState<boolean>(false);

  // Generate all positions in the grid using axial coordinates

  // Track player entities
  const [playerEntities, setPlayerEntities] = useState<PlayerEntity[]>([]);

  // Enemy entities on the grid
  const [enemyEntities, setEnemyEntities] = useState<EnemyEntity[]>([]);

  // Track pending moves for the current turn
  const [pendingMoves, setPendingMoves] = useState<Map<string, GridPosition>>(new Map());

  const [allGridPositions, setAllGridPositions] = useState<GridPosition[]>([]);

  useEffect(() => {
    const gridPositions = createHexagonalGrid();
    setAllGridPositions(gridPositions);
  }, []);

  // Track game turns
  const [currentTurn, setCurrentTurn] = useState<number>(1);

  // Initialize a new game
  const initializeNewGame = useCallback(() => {
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

      // Create the entities at the shuffled positions
      const newPlayerEntities: PlayerEntity[] = [
        {
          id: "archer-1",
          position: shuffledPositions[0],
          entityType: playerUnitTypes.archer,
        },
        {
          id: "cavalry-1",
          position: shuffledPositions[1],
          entityType: playerUnitTypes.cavalry,
        },
        {
          id: "infantry-1",
          position: shuffledPositions[2],
          entityType: playerUnitTypes.infantry,
        },
      ];

      setPlayerEntities(newPlayerEntities);
      setCurrentTurn(1);

      // Add enemy units at the far end of the map
      const enemyPosition = allGridPositions
        .filter((pos) => {
          // Find positions at the far end of the map
          const distance = Math.abs(pos.q) + Math.abs(pos.r);
          const posKey = `${pos.q},${pos.r}`;
          const terrain = newTerrainMap.get(posKey);
          // Choose non-water terrain that's far from the center
          return distance > 4 && terrain && terrain.type !== "water";
        })
        .sort(() => Math.random() - 0.5)[0]; // Pick a random position from candidates

      const newEnemyEntities: EnemyEntity[] = [
        {
          id: "clobbin-1",
          position: enemyPosition,
          entityType: enemyUnitTypes.clobbin,
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
  }, [allGridPositions]);

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
  }, [initializeNewGame]);

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
  }, [allGridPositions, initializeNewGame]);

  // Use custom hook to animate hexagons appearing one by one
  const visibleHexagons = useHexagonAnimation({
    allGridPositions,
    animationDelay: ANIMATION_DELAY,
    terrainMap,
    defaultTerrain: TERRAIN_TYPES.grass,
    playerEntities,
  });

  const hexagonPoints = generateHexPoints();

  // Helper function to determine the fill color based on hexagon state
  // Handle tile selection for movement/attack
  const handleTileSelection = (targetPosition: HexagonData) => {
    if (!selectedEntity) return;

    // Check if there's an enemy at the target position (not implemented yet)
    const hasEnemy = false; // This will need to be updated when enemies are added

    // Add to pending moves instead of immediately moving
    const newPendingMoves = new Map(pendingMoves);
    newPendingMoves.set(selectedEntity.id, { q: targetPosition.q, r: targetPosition.r });
    setPendingMoves(newPendingMoves);

    // Clear movement range and selection state
    setMovementRangeHexagons([]);
    setSelectedEntity(null);
    setIsSelectingDestination(false);
  };

  // Execute all pending moves and advance turn
  const executeMoves = () => {
    if (pendingMoves.size === 0) return;

    // Apply all pending moves to entities
    const updatedEntities = playerEntities.map((entity) => {
      const pendingMove = pendingMoves.get(entity.id);
      if (pendingMove) {
        return {
          ...entity,
          position: pendingMove,
        };
      }
      return entity;
    });

    // Update state
    const nextTurn = currentTurn + 1;
    setPlayerEntities(updatedEntities);
    setPendingMoves(new Map());
    setCurrentTurn(nextTurn);

    // Save game state after moves are executed
    saveGameState({
      terrainMap: terrainMapToArray(terrainMap),
      playerEntities: updatedEntities,
      currentTurn: nextTurn,
      gameStartedAt: loadGameState()?.gameStartedAt || Date.now(),
      lastSavedAt: Date.now(),
      enemyEntities: enemyEntities,
    });
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

  const getHexagonFillColor = (position: HexagonData): string => {
    // Check if hexagon is hovered
    // if (hoveredHexagon && hoveredHexagon.q === position.q && hoveredHexagon.r === position.r) {
    //   return `${position.terrain.color}80`;
    // }

    // Check if hexagon is in movement range
    if (
      selectedEntity &&
      movementRangeHexagons.some((pos) => pos.q === position.q && pos.r === position.r)
    ) {
      return `${position.terrain.color}90`; // Terrain color with 90% opacity for movement range
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, sm: 4 },
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          maxHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Reset button */}
        <ResetButton onReset={handleReset} />

        {/* Turn indicator */}
        <Box
          sx={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "5px 10px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          Turn: {currentTurn}
        </Box>
        {/* Display selected entity info panel */}
        <EntityInfoPanel selectedEntity={selectedEntity} />

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
                sx={{
                  position: "absolute",
                  left: `calc(50% + ${xPosition}px)`,
                  top: `calc(50% + ${yPositionInverted}px)`,
                  transform: "translate(-50%, -50%)",
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
                  <polygon
                    points={hexagonPoints}
                    fill={getHexagonFillColor(position)}
                    strokeWidth={
                      selectedEntity &&
                      movementRangeHexagons.some(
                        (pos) => pos.q === position.q && pos.r === position.r
                      )
                        ? "2"
                        : "0"
                    }
                    stroke="none"
                  />
                  {/* Coordinate text - scales with hexagon size */}
                  <text
                    x="50"
                    y="30"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="black"
                    fontSize={Math.max(hexSize / 5, 8)}
                    fontWeight="bold"
                  >
                    {`${position.q},${position.r}`}
                  </text>

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
                            {/* Entity background circle */}
                            <circle
                              cx="50"
                              cy="60"
                              r="15"
                              fill={entity.entityType.color}
                              stroke={
                                selectedEntity && selectedEntity.id === entity.id
                                  ? "#FFF"
                                  : pendingMoves.has(entity.id)
                                  ? "#FFA500" // Orange outline for units with pending moves
                                  : "#444"
                              }
                              strokeWidth={
                                (selectedEntity && selectedEntity.id === entity.id) ||
                                pendingMoves.has(entity.id)
                                  ? "3"
                                  : "1.5"
                              }
                              style={{ cursor: "pointer" }}
                            />
                            {/* Entity type icon */}
                            <text
                              x="50"
                              y="60"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="14"
                              fontWeight="bold"
                              style={{ pointerEvents: "none" }} // Make text non-clickable
                            >
                              {entity.entityType.type === "archer"
                                ? "🏹"
                                : entity.entityType.type === "cavalry"
                                ? "🐎"
                                : entity.entityType.type === "infantry"
                                ? "⚔️"
                                : ""}
                            </text>
                          </g>
                        );
                      }

                      // Show ghost preview of pending moves
                      const pendingEntity = getEntityWithPendingMoveTo(position);
                      if (pendingEntity) {
                        return (
                          <g key={`ghost-${pendingEntity.id}`} opacity="0.5">
                            {/* Ghost entity background circle */}
                            <circle
                              cx="50"
                              cy="60"
                              r="15"
                              fill={pendingEntity.entityType.color}
                              stroke="#888"
                              strokeWidth="1.5"
                              strokeDasharray="2,2"
                            />
                            {/* Ghost entity type icon */}
                            <text
                              x="50"
                              y="60"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="14"
                              fontWeight="bold"
                            >
                              {pendingEntity.entityType.type === "archer"
                                ? "🏹"
                                : pendingEntity.entityType.type === "cavalry"
                                ? "🐎"
                                : pendingEntity.entityType.type === "infantry"
                                ? "⚔️"
                                : ""}
                            </text>
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

      {/* Execute moves button */}
      {pendingMoves.size > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={executeMoves}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            End Turn ({pendingMoves.size})
          </button>
        </Box>
      )}
    </Container>
  );
};

export default MainPage;
