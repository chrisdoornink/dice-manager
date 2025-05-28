"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Box, Fade } from "@mui/material";

// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
type GridPosition = { q: number; r: number };

// Define terrain types and their colors
type TerrainType = 'grass' | 'mountain' | 'forest' | 'water';

interface TerrainDefinition {
  type: TerrainType;
  color: string;
}

// Hexagon with terrain data
interface HexagonData extends GridPosition {
  terrain: TerrainDefinition;
}

const MainPage = () => {
  // CONFIGURABLE GRID PARAMETERS
  // Boundary coordinates for rectangular grid using useMemo to prevent recreating on each render
  const GRID_BOUNDS = useMemo(
    () => ({
      qMin: -3, // Leftmost column
      qMax: 3, // Rightmost column
      rMin: -2, // Bottom row at leftmost edge [-3,-2]
      rMax: 6, // Top row
    }),
    []
  );
  const ANIMATION_DELAY = 80; // Milliseconds between adding each hexagon

  // Helper function to determine if two hexagons are adjacent
  const areHexagonsAdjacent = (a: GridPosition, b: GridPosition): boolean => {
    // In axial coordinates, two hexagons are adjacent if:
    // They differ by exactly 1 in one coordinate and 0 in the other, OR
    // They differ by exactly 1 in both coordinates, but in opposite directions
    const dq = Math.abs(a.q - b.q);
    const dr = Math.abs(a.r - b.r);
    const dqr = Math.abs(a.q + a.r - (b.q + b.r));

    // Two hexagons are adjacent if the sum of differences is exactly 1 or 2 in a specific way
    return dq + dr + dqr === 2;
  };

  // Example of getting all neighbors for a given hexagon
  const getNeighbors = (pos: GridPosition): GridPosition[] => {
    // The six directions to adjacent hexagons in axial coordinates
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ];

    return directions.map((dir) => ({
      q: pos.q + dir.q,
      r: pos.r + dir.r,
    }));
  };
  // (moved up to the config section)

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

  // Calculate optimal hexagon size based on window dimensions and grid bounds
  const hexSize = useMemo(() => {
    // Estimate the grid dimensions in logical units
    const logicalWidth = GRID_BOUNDS.qMax - GRID_BOUNDS.qMin + 1;
    const logicalHeight = GRID_BOUNDS.rMax - GRID_BOUNDS.rMin + 1;

    // Apply safety margins for container padding
    const safetyFactor = 0.85; // Use 85% of the available space
    // Account for mobile vs desktop - use more aggressive scaling on smaller screens
    const isMobile = windowDimensions.width < 768;
    const mobileFactor = isMobile ? 0.95 : 0.85;
    const availableWidth = windowDimensions.width * mobileFactor;
    const availableHeight = windowDimensions.height * mobileFactor;

    // Calculate size constraints based on logical dimensions
    // For horizontal constraint: we need 1.5*q hexagons to fit in width (due to overlapping)
    // For vertical constraint: we need sqrt(3)*r hexagons to fit in height
    const widthConstraint = availableWidth / (logicalWidth * 1.5);
    const heightConstraint = availableHeight / (logicalHeight * Math.sqrt(3));

    // Choose the smaller of the two constraints
    const baseSize = Math.min(widthConstraint, heightConstraint);

    // Apply a minimum size to ensure hexagons aren't too small
    // And a maximum size to ensure they don't get too large on big screens
    return Math.min(Math.max(baseSize, 20), 60);
  }, [windowDimensions, GRID_BOUNDS]);

  // Calculate the dimensions of a hexagon based on size
  // For a regular hexagon with flat tops:
  const hexWidth = 2 * hexSize; // Width = 2 × radius
  const hexHeight = Math.sqrt(3) * hexSize; // Height = √3 × radius

  // Calculate the proper spacing to make borders touch
  // For horizontally adjacent hexagons in same row
  const horizontalSpacing = 1.5 * hexSize; // Centers are 1.5 × radius apart horizontally
  // For vertically adjacent hexagons
  const verticalSpacing = hexHeight; // Centers are exactly the height apart vertically

  // Define terrain types and their colors
  const terrainTypes = useMemo(() => ({
    grass: { type: 'grass' as TerrainType, color: '#7EC850' },
    mountain: { type: 'mountain' as TerrainType, color: '#A0A0A0' },
    forest: { type: 'forest' as TerrainType, color: '#2D8659' },
    water: { type: 'water' as TerrainType, color: '#5DA9E9' },
  }), []);
  
  // Helper function to get a random terrain type
  const getRandomTerrain = useCallback(() => {
    const types = Object.values(terrainTypes);
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  }, [terrainTypes]);
  
  // Track which hexagons are currently visible with their terrain
  // Start with the origin (0,0) in axial coordinates
  const [visibleHexagons, setVisibleHexagons] = useState<HexagonData[]>([
    { q: 0, r: 0, terrain: terrainTypes.grass }
  ]);

  // Track the currently hovered hexagon
  const [hoveredHexagon, setHoveredHexagon] = useState<GridPosition | null>(null);

  // Track which hexagons are highlighted as neighbors
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<GridPosition[]>([]);

  // Generate all positions in the grid using axial coordinates
  const allGridPositions = useMemo(() => {
    const positions: GridPosition[] = [];

    // List of hexagons to exclude (explicitly not visible)
    const excludedHexagons = [
      { q: -2, r: -3 },
      { q: -1, r: -4 },
      { q: 0, r: -4 },
      { q: 1, r: -5 },
      { q: 2, r: -5 },
      { q: 2, r: -6 },
      { q: 3, r: -6 },
    ];

    // List of hexagons to force include (even if outside calculated boundaries)
    const includedHexagons = [
      { q: -1, r: 5 },
      { q: 0, r: 4 },
      { q: 1, r: 4 },
    ];

    // Helper function to check if a position should be excluded
    const isExcluded = (pos: GridPosition): boolean => {
      return excludedHexagons.some((h) => h.q === pos.q && h.r === pos.r);
    };

    // Helper function to check if a position should be forcibly included
    const isForcedInclusion = (pos: GridPosition): boolean => {
      return includedHexagons.some((h) => h.q === pos.q && h.r === pos.r);
    };

    // Generate a rectangular grid with the specified boundaries
    for (let q = GRID_BOUNDS.qMin; q <= GRID_BOUNDS.qMax; q++) {
      // Calculate the r range based on q to create the rectangular shape
      // For mobile, we want it taller in the vertical direction
      // Adjust r boundaries based on q position to create the specified shape
      let rMin = GRID_BOUNDS.rMin;
      let rMax = GRID_BOUNDS.rMax;

      // Apply constraints for the diagonal edge (top-right and bottom-right)
      // This creates the specified corner points: [-3,6], [3,3], [-3,-2], [3,-6]
      if (q > GRID_BOUNDS.qMin) {
        // Adjust top boundary (decreases as q increases)
        rMax = Math.max(GRID_BOUNDS.rMax - (q - GRID_BOUNDS.qMin), 3);

        // Adjust bottom boundary based on q to create the proper diagonal
        // From [-3,-2] to [3,-6] we need to decrease by 2/3 units per q step
        // For each q unit increase, r decreases by 4/6 units
        const bottomSlope = 4 / 6; // How much r decreases per q increase
        rMin = Math.floor(GRID_BOUNDS.rMin - bottomSlope * (q - GRID_BOUNDS.qMin));

        // Make sure we don't go below -6 for any q
        rMin = Math.max(rMin, -6);
      }

      for (let r = rMin; r <= rMax; r++) {
        const position = { q, r };
        // Only add this position if it's not in the excluded list
        if (!isExcluded(position)) {
          positions.push(position);
        }
      }
    }

    // Add any forced inclusions that weren't already added
    for (const position of includedHexagons) {
      // Check if this position is already in the positions array
      const alreadyExists = positions.some((p) => p.q === position.q && p.r === position.r);

      // If not already in the positions array, add it
      if (!alreadyExists) {
        positions.push(position);
      }
    }
    // Sort positions by distance from center (0,0) for animation purposes
    return positions.sort((a, b) => {
      // In axial coordinates, distance from origin is calculated with Manhattan distance formula
      const distA = (Math.abs(a.q) + Math.abs(a.r) + Math.abs(a.q + a.r)) / 2;
      const distB = (Math.abs(b.q) + Math.abs(b.r) + Math.abs(b.q + b.r)) / 2;
      return distA - distB;
    });
  }, [GRID_BOUNDS]);

  // Remove the center position as it's already visible
  const hexagonSequence = useMemo(() => {
    return allGridPositions.filter((pos) => !(pos.q === 0 && pos.r === 0));
  }, [allGridPositions]);

  // Add new hexagons after delay, one by one
  useEffect(() => {
    // Function to add the next hexagon in sequence
    const addNextHexagon = (index: number) => {
      if (index >= hexagonSequence.length) return;

      const timer = setTimeout(() => {
        setVisibleHexagons((prev) => [
          ...prev, 
          { ...hexagonSequence[index], terrain: getRandomTerrain() }
        ]);
        // Schedule the next hexagon
        addNextHexagon(index + 1);
      }, ANIMATION_DELAY);

      return () => clearTimeout(timer);
    };

    // Start adding hexagons after a short delay
    const initialTimer = setTimeout(() => {
      addNextHexagon(0);
    }, 1000);

    return () => clearTimeout(initialTimer);
  }, [hexagonSequence, ANIMATION_DELAY, getRandomTerrain]);

  // Calculate the total grid dimensions based on all visible hexagons
  const gridDimensions = useMemo(() => {
    if (visibleHexagons.length === 0)
      return { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // Convert all hexagon positions to pixel coordinates
    const pixelPositions = visibleHexagons.map((position) => {
      const xPosition = hexSize * ((3 / 2) * position.q);
      const yPosition = hexSize * ((Math.sqrt(3) / 2) * position.q + Math.sqrt(3) * position.r);
      const yPositionInverted = -yPosition;

      return {
        x: xPosition,
        y: yPositionInverted,
      };
    });

    // Find min and max coordinates
    const minX = Math.min(...pixelPositions.map((p) => p.x)) - hexWidth / 2;
    const maxX = Math.max(...pixelPositions.map((p) => p.x)) + hexWidth / 2;
    const minY = Math.min(...pixelPositions.map((p) => p.y)) - hexHeight / 2;
    const maxY = Math.max(...pixelPositions.map((p) => p.y)) + hexHeight / 2;

    return {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      maxX,
      minY,
      maxY,
    };
  }, [visibleHexagons, hexSize, hexWidth, hexHeight]);

  // Log dimensions when all hexagons are visible
  useEffect(() => {
    if (visibleHexagons.length === allGridPositions.length) {
      console.log("Grid dimensions:", gridDimensions);
      console.log("Total hexagons:", visibleHexagons.length);
    }
  }, [visibleHexagons.length, allGridPositions.length, gridDimensions]);

  // Function to generate exact SVG points for a hexagon
  const generateHexPoints = () => {
    const points = [];
    // Control the size of the hexagon within its SVG container
    // Increasing this number (closer to 50) makes hexagons larger with less padding
    // The maximum would be 50, which would make hexagons touch exactly at corners
    const hexRadius = 57.5; // Previously 48, now 57.5 for tighter packing

    for (let i = 0; i < 6; i++) {
      // For a flat-topped hexagon, angles are at 0, 60, 120, 180, 240, 300 degrees
      const angle = (Math.PI / 180) * (60 * i);
      const x = 50 + hexRadius * Math.cos(angle);
      const y = 50 + hexRadius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

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
                  setHighlightedNeighbors(getNeighbors(position));
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
                        : highlightedNeighbors.some((n) => n.q === position.q && n.r === position.r)
                        ? "#80cbc4" // Teal for adjacent hexagons
                        : position.terrain.color // Terrain color
                    }
                    strokeWidth="0" // Remove the border
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

                  {/* Example of additional content that scales with the hexagon */}
                  <g transform={`scale(${hexSize / 60})`} style={{ transformOrigin: "50px 60px" }}>
                    {/* This group will scale all contained elements based on hexagon size */}
                    {/* A simple icon example - this will scale up/down with the hexagon */}
                    <circle cx="50" cy="60" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
                    <text
                      x="50"
                      y="60"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#555"
                      fontSize="10"
                      fontWeight="normal"
                    >
                      {position.q + position.r === 0 ? "⬦" : ""}
                    </text>
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
