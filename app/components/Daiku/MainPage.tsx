"use client";

import React, { useState, useEffect } from "react";
import { Container, Box, Fade } from "@mui/material";
import { GridPosition, TerrainDefinition, PlayerEntity } from "./utils/types";
import { EntityInfoPanel } from "./components/EntityInfoPanel";
import { calculateMovementRange } from "./utils/calculateMovementRange";
import { getNeighboringTiles } from "./utils/getNeigboringTiles";
import { generateHexPoints } from "./utils/hexMath";
import { useHexagonAnimation } from "./hooks/useHexagonAnimation";
import { ANIMATION_DELAY, TERRAIN_TYPES } from "./utils/generateTerrainMap";
import { generateTerrainMap } from "./utils/generateTerrainMap";
import { playerUnitTypes, enemyUnitTypes } from "./utils/entityTypes";
import { useHexagonalGrid } from "./hooks/useHexagonalGrid";
import { useHexagonSize } from "./hooks/useHexagonSize";

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

  // Generate all positions in the grid using axial coordinates
  const allGridPositions = useHexagonalGrid();

  // Track player entities
  const [playerEntities, setPlayerEntities] = useState<PlayerEntity[]>([]);

  // Generate terrain map and place initial entities
  useEffect(() => {
    if (allGridPositions.length > 0) {
      const newTerrainMap = generateTerrainMap(allGridPositions);
      setTerrainMap(newTerrainMap);

      // Set the initial center hexagon with its terrain
      const centerTerrain = newTerrainMap.get("0,0")!;

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

      // No need to initialize visible hexagons here - now handled by useHexagonAnimation hook
    }
  }, [allGridPositions]);

  // Use custom hook to animate hexagons appearing one by one
  const visibleHexagons = useHexagonAnimation({
    allGridPositions,
    animationDelay: ANIMATION_DELAY,
    terrainMap,
    defaultTerrain: TERRAIN_TYPES.grass,
    playerEntities,
  });

  const hexagonPoints = generateHexPoints();

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
            <Fade key={`${position.q}-${position.r}`} in={true} timeout={1000}>
              <Box
                sx={{
                  position: "absolute",
                  left: `calc(50% + ${xPosition}px)`,
                  top: `calc(50% + ${yPositionInverted}px)`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  // Debug border to see the box boundaries
                  // border: '1px dashed blue'
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
                    fill={
                      hoveredHexagon &&
                      hoveredHexagon.q === position.q &&
                      hoveredHexagon.r === position.r
                        ? "#ffcc80" // Orange for hovered hexagon
                        : selectedEntity &&
                          movementRangeHexagons.some(
                            (pos) => pos.q === position.q && pos.r === position.r
                          )
                        ? `${position.terrain.color}80` // Terrain color with 50% opacity for movement range
                        : highlightedNeighbors.some((n) => n.q === position.q && n.r === position.r)
                        ? "#80cbc4" // Teal for adjacent hexagons
                        : position.terrain.color // Terrain color
                    }
                    strokeWidth={
                      selectedEntity &&
                      movementRangeHexagons.some(
                        (pos) => pos.q === position.q && pos.r === position.r
                      )
                        ? "2"
                        : "0"
                    }
                    stroke={
                      selectedEntity &&
                      movementRangeHexagons.some(
                        (pos) => pos.q === position.q && pos.r === position.r
                      )
                        ? "#FF9800"
                        : "none"
                    }
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
                      // Only handle clicks if there's an entity here
                      if (position.entity) {
                        e.stopPropagation(); // Prevent triggering hexagon click
                        // If already selected, deselect
                        if (selectedEntity && selectedEntity.id === position.entity.id) {
                          setSelectedEntity(null);
                          setMovementRangeHexagons([]);
                        } else {
                          // Otherwise select this entity and calculate movement range
                          setSelectedEntity(position.entity);
                          const movementRangeHexagons = calculateMovementRange(
                            position.entity,
                            terrainMap
                          );
                          setMovementRangeHexagons(movementRangeHexagons);
                        }
                      }
                    }}
                  >
                    {/* If there's an entity at this position, show it */}
                    {position.entity && (
                      <>
                        {/* Entity background circle */}
                        <circle
                          cx="50"
                          cy="60"
                          r="15"
                          fill={position.entity.entityType.color}
                          stroke={
                            selectedEntity && selectedEntity.id === position.entity.id
                              ? "#FFF"
                              : "#444"
                          }
                          strokeWidth={
                            selectedEntity && selectedEntity.id === position.entity.id ? "3" : "1.5"
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
                          style={{ pointerEvents: "none" }} // Make text non-clickable (let circle handle clicks)
                        >
                          {position.entity.entityType.type === "archer"
                            ? "🏹"
                            : position.entity.entityType.type === "cavalry"
                            ? "🐎"
                            : position.entity.entityType.type === "infantry"
                            ? "⚔️"
                            : ""}
                        </text>
                      </>
                    )}
                  </g>
                </svg>
              </Box>
            </Fade>
          );
        })}
      </Box>
    </Container>
  );
};

export default MainPage;
