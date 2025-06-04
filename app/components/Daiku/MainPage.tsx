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
import useEnemyAI from "./hooks/useEnemyAI";
import Entity from "./components/Entity";
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
import SpriteDebugModal from "./components/SpriteDebugModal";
import PlayerStatusFooter from "./components/PlayerStatusFooter";
import PixelatedButton from "./components/PixelatedButton";

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

  // take into account the 10% header and   10% footer
  const calculatedWindowDimensions = {
    width: windowDimensions.width * 0.8,
    height: windowDimensions.height * 0.8,
  };

  const [hexSize, hexWidth, hexHeight] = useHexagonSize({
    windowDimensions: calculatedWindowDimensions,
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorMessageTimeout, setErrorMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  // Enemy turn tracking
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [enemyPendingMoves, setEnemyPendingMoves] = useState<Map<string, GridPosition>>(new Map());

  // Access the enemy AI hook
  const { calculateEnemyMoves } = useEnemyAI();

  const [allGridPositions, setAllGridPositions] = useState<GridPosition[]>([]);

  useEffect(() => {
    const gridPositions = createHexagonalGrid();
    setAllGridPositions(gridPositions);
  }, []);

  // Track game turns
  const [currentTurn, setCurrentTurn] = useState<number>(1);

  // State for sprite debug modal
  const [spriteDebugModalOpen, setSpriteDebugModalOpen] = useState<boolean>(false);

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

      // Create the entities at the shuffled positions - one of each type for easier debugging
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
        {
          id: "mage-1",
          position: shuffledPositions[3] || { q: 1, r: -1 }, // Fallback position if not enough shuffled positions
          entityType: playerUnitTypes.mage,
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
          entityType: enemyUnitTypes.clobbin,
          isEnemy: true,
        },
        {
          id: "spud dle-1",
          position: getEnemyPosition(),
          entityType: enemyUnitTypes.spuddle,
          isEnemy: true,
        },
        {
          id: "skritcher-1",
          position: getEnemyPosition(),
          entityType: enemyUnitTypes.skritcher,
          isEnemy: true,
        },
        {
          id: "whumble-1",
          position: getEnemyPosition(),
          entityType: enemyUnitTypes.whumble,
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

  // Save game state whenever critical parts change
  useEffect(() => {
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
  }, [playerEntities, enemyEntities, currentTurn, terrainMap]);

  // Use a state to track if the grid has been initialized
  const [gridInitialized, setGridInitialized] = useState(false);

  // Use the animation hook only for initial grid setup
  const animatedHexagons = useHexagonAnimation({
    allGridPositions,
    animationDelay: ANIMATION_DELAY,
    terrainMap,
    defaultTerrain: TERRAIN_TYPES.grass,
    playerEntities: [], // Remove dependency on playerEntities to prevent re-animations
  });

  // Create a static grid representation for subsequent renders
  const staticHexagons = React.useMemo(() => {
    return allGridPositions.map((pos) => {
      const posKey = `${pos.q},${pos.r}`;
      const terrain = terrainMap.get(posKey) || TERRAIN_TYPES.grass;
      return { q: pos.q, r: pos.r, terrain } as HexagonData;
    });
  }, [allGridPositions, terrainMap]);

  // Only use animation on initial load, not for every state update
  const visibleHexagons = React.useMemo(() => {
    // Once we've seen the animation once, use static grid for all future renders
    if (animatedHexagons.length === allGridPositions.length && !gridInitialized) {
      setGridInitialized(true);
    }

    return gridInitialized ? staticHexagons : animatedHexagons;
  }, [animatedHexagons, staticHexagons, allGridPositions.length, gridInitialized]);

  const hexagonPoints = generateHexPoints();

  // Helper function to determine the fill color based on hexagon state
  // Handle tile selection for movement/attack
  const handleTileSelection = (targetPosition: HexagonData) => {
    if (!selectedEntity) return;

    // Check if the target position will be occupied after all pending moves
    const willBeOccupied = () => {
      // Get all entities (both player and enemy)
      const allEntities = [...playerEntities, ...enemyEntities];

      // First, check if any entity without a pending move will be at the target position
      const entityAtTarget = allEntities.find((entity) => {
        // Skip the currently selected entity since it's moving
        if (entity.id === selectedEntity.id) return false;

        // If this entity has a pending move, skip it (its current position will be vacated)
        if (pendingMoves.has(entity.id)) return false;

        // Check if this entity's position matches the target position
        return entity.position.q === targetPosition.q && entity.position.r === targetPosition.r;
      });

      if (entityAtTarget) return true;

      // Next, check if any other entity has a pending move to this same position
      const pendingMoveToTarget = Array.from(pendingMoves.entries()).some(
        ([entityId, position]) => {
          // Skip the currently selected entity
          if (entityId === selectedEntity.id) return false;

          return position.q === targetPosition.q && position.r === targetPosition.r;
        }
      );

      return pendingMoveToTarget;
    };

    // Don't allow moving to an occupied position
    if (willBeOccupied()) {
      // Clear any existing timeout
      if (errorMessageTimeout) {
        clearTimeout(errorMessageTimeout);
      }

      // Set error message
      setErrorMessage("Cannot move to an occupied position");

      // Clear the message after 2 seconds
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 2000);

      setErrorMessageTimeout(timeout);
      return;
    }

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
      // Make all terrain types lighter when highlighted in movement range
      if (position.terrain.type === "grass") return "#CEFFA0";
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
      <SpriteDebugModal
        open={spriteDebugModalOpen}
        onClose={() => setSpriteDebugModalOpen(false)}
      />
    </Container>
  );
};

export default MainPage;
