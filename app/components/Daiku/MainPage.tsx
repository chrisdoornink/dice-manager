"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Container, Box, Fade } from "@mui/material";

// Define a type for our grid positions
type GridPosition = { row: number; col: number };

const MainPage = () => {
  // CONFIGURABLE GRID PARAMETERS
  const GRID_ROWS = 5; // Total rows in the grid (must be odd to have a center)
  const GRID_COLS = 5; // Total columns in the grid (must be odd to have a center)
  const ANIMATION_DELAY = 100; // Milliseconds between adding each hexagon

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
  const [visibleHexagons, setVisibleHexagons] = useState<GridPosition[]>([{ row: 0, col: 0 }]);

  // Generate all positions in the grid
  const allGridPositions = useMemo(() => {
    const positions: GridPosition[] = [];
    const centerRow = Math.floor(GRID_ROWS / 2);
    const centerCol = Math.floor(GRID_COLS / 2);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push({
          row: row - centerRow,
          col: col - centerCol,
        });
      }
    }

    // Sort positions by distance from center for animation purposes
    return positions.sort((a, b) => {
      const distA = Math.abs(a.row) + Math.abs(a.col);
      const distB = Math.abs(b.row) + Math.abs(b.col);
      return distA - distB;
    });
  }, [GRID_ROWS, GRID_COLS]);

  // Remove the center position as it's already visible
  const hexagonSequence = useMemo(() => {
    return allGridPositions.filter((pos) => !(pos.row === 0 && pos.col === 0));
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
          // For a honeycomb pattern with flat-topped hexagons:
          // Even-numbered rows are aligned
          // Odd-numbered rows are offset by 3/4 of the hex width to create perfect touching
          const rowOffset = position.row % 2 === 0 ? 0 : hexWidth * 0.75;
          const xPosition = position.col * (hexWidth * 1.5) + rowOffset;
          const yPosition = position.row * (hexHeight / 2);

          return (
            <Fade key={`${position.row}-${position.col}`} in={true} timeout={1000}>
              <Box
                sx={{
                  position: "absolute",
                  left: `calc(50% + ${xPosition}px)`,
                  top: `calc(50% + ${yPosition}px)`,
                  transform: "translate(-50%, -50%)",
                  // Debug border to see the box boundaries
                  // border: '1px dashed blue'
                }}
              >
                <svg
                  width={hexWidth}
                  height={hexHeight}
                  viewBox="0 0 100 100"
                  style={{ display: "block" }} // Remove any default spacing
                >
                  <polygon points={hexagonPoints} fill="white" stroke="black" strokeWidth="2" />
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
