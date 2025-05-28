"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Container, Box, Fade } from "@mui/material";

// Define a type for our grid positions using axial coordinates
// q: column axis, r: diagonal axis
type GridPosition = { q: number; r: number };

const MainPage = () => {
  // CONFIGURABLE GRID PARAMETERS
  const GRID_SIZE = 4; // This determines the radius of the hexagonal grid (number of rings around center)
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
    const radius = GRID_SIZE; // Radius determines how many rings around center
    
    // Generate a hexagonal grid with axial coordinates
    // For a radius of 2, this creates a grid with center and two rings around it
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        positions.push({ q, r });
      }
    }

    // Sort positions by distance from center (0,0) for animation purposes
    return positions.sort((a, b) => {
      // In axial coordinates, distance from origin is calculated with Manhattan distance formula
      const distA = (Math.abs(a.q) + Math.abs(a.r) + Math.abs(a.q + a.r)) / 2;
      const distB = (Math.abs(b.q) + Math.abs(b.r) + Math.abs(b.q + b.r)) / 2;
      return distA - distB;
    });
  }, [GRID_SIZE]);

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
