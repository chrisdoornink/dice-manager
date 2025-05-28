"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Container, Box, Fade } from "@mui/material";

// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
type GridPosition = { q: number; r: number };

const MainPage = () => {
  // CONFIGURABLE GRID PARAMETERS
  // Boundary coordinates for rectangular grid using useMemo to prevent recreating on each render
  const GRID_BOUNDS = useMemo(() => ({
    qMin: -3, // Leftmost column
    qMax: 3,  // Rightmost column
    rMin: -2, // Bottom row at leftmost edge [-3,-2]
    rMax: 6,  // Top row
  }), []);
  const ANIMATION_DELAY = 80; // Milliseconds between adding each hexagon
  
  // Helper function to determine if two hexagons are adjacent
  const areHexagonsAdjacent = (a: GridPosition, b: GridPosition): boolean => {
    // In axial coordinates, two hexagons are adjacent if:
    // They differ by exactly 1 in one coordinate and 0 in the other, OR
    // They differ by exactly 1 in both coordinates, but in opposite directions
    const dq = Math.abs(a.q - b.q);
    const dr = Math.abs(a.r - b.r);
    const dqr = Math.abs((a.q + a.r) - (b.q + b.r));
    
    // Two hexagons are adjacent if the sum of differences is exactly 1 or 2 in a specific way
    return (dq + dr + dqr) === 2;
  };
  
  // Example of getting all neighbors for a given hexagon
  const getNeighbors = (pos: GridPosition): GridPosition[] => {
    // The six directions to adjacent hexagons in axial coordinates
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];
    
    return directions.map(dir => ({
      q: pos.q + dir.q,
      r: pos.r + dir.r
    }));
  };
  // (moved up to the config section)

  // Hexagon size configuration
  const hexSize = 60; // Base size of the hexagon

  // Calculate the dimensions of a hexagon based on size
  // For a regular hexagon with flat tops:
  const hexWidth = 2 * hexSize; // Width = 2 × radius
  const hexHeight = Math.sqrt(3) * hexSize; // Height = √3 × radius

  // Calculate the proper spacing to make borders touch
  // For horizontally adjacent hexagons in same row
  const horizontalSpacing = 1.5 * hexSize; // Centers are 1.5 × radius apart horizontally
  // For vertically adjacent hexagons
  const verticalSpacing = hexHeight; // Centers are exactly the height apart vertically

  // Track which hexagons are currently visible
  // Start with the origin (0,0) in axial coordinates
  const [visibleHexagons, setVisibleHexagons] = useState<GridPosition[]>([{ q: 0, r: 0 }]);
  
  // Track the currently hovered hexagon
  const [hoveredHexagon, setHoveredHexagon] = useState<GridPosition | null>(null);
  
  // Track which hexagons are highlighted as neighbors
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<GridPosition[]>([]);

  // Generate all positions in the grid using axial coordinates
  const allGridPositions = useMemo(() => {
    const positions: GridPosition[] = [];
    
    // List of hexagons to exclude (explicitly not visible)
    const excludedHexagons = [
      {q: -2, r: -3}, {q: -1, r: -4}, {q: 0, r: -4},
      {q: 1, r: -5}, {q: 2, r: -5}, {q: 2, r: -6}, {q: 3, r: -6}
    ];
    
    // List of hexagons to force include (even if outside calculated boundaries)
    const includedHexagons = [
      {q: -1, r: 5}, {q: 0, r: 4}, {q: 1, r: 4}
    ];
    
    // Helper function to check if a position should be excluded
    const isExcluded = (pos: GridPosition): boolean => {
      return excludedHexagons.some(h => h.q === pos.q && h.r === pos.r);
    };
    
    // Helper function to check if a position should be forcibly included
    const isForcedInclusion = (pos: GridPosition): boolean => {
      return includedHexagons.some(h => h.q === pos.q && h.r === pos.r);
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
        const bottomSlope = 4/6; // How much r decreases per q increase
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
      const alreadyExists = positions.some(p => p.q === position.q && p.r === position.r);
      
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
        setVisibleHexagons((prev) => [...prev, hexagonSequence[index]]);
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
  }, [hexagonSequence, ANIMATION_DELAY]);

  // Function to generate exact SVG points for a hexagon
  const generateHexPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      // For a flat-topped hexagon, angles are at 0, 60, 120, 180, 240, 300 degrees
      const angle = (Math.PI / 180) * (60 * i);
      const x = 50 + 48 * Math.cos(angle); // 48 instead of 50 to prevent tiny gaps from rounding
      const y = 50 + 48 * Math.sin(angle);
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
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Render all visible hexagons */}
        {visibleHexagons.map((position, index) => {
          // Convert axial coordinates to pixel coordinates for flat-topped hexagons
          // Formula for flat-top hexagons in axial coordinates:
          const xPosition = hexSize * (3/2 * position.q);
          const yPosition = hexSize * (Math.sqrt(3)/2 * position.q + Math.sqrt(3) * position.r);
          
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
                      hoveredHexagon && hoveredHexagon.q === position.q && hoveredHexagon.r === position.r 
                        ? "#ffcc80" // Orange for hovered hexagon
                        : highlightedNeighbors.some(n => n.q === position.q && n.r === position.r)
                          ? "#80cbc4" // Teal for adjacent hexagons
                          : "white" // Default color
                    } 
                    stroke="black" 
                    strokeWidth="2" 
                  />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="black"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {`${position.q},${position.r}`}
                  </text>
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
