"use client";

import React, { useState, useEffect } from "react";
import { Container, Box, Fade } from "@mui/material";

// Define a type for our grid positions
type GridPosition = { row: number; col: number };

const MainPage = () => {
  // Track which hexagons should be displayed
  const [visibleHexagons, setVisibleHexagons] = useState<GridPosition[]>([{ row: 0, col: 0 }]);

  // Width and height of a single hexagon
  const hexSize = 100;
  const hexWidth = hexSize;
  const hexHeight = hexSize;

  // Calculate horizontal and vertical spacing
  const horizontalSpacing = hexWidth * 0.6; // Overlap hexagons horizontally
  const verticalSpacing = hexHeight * 0.87; // Overlap hexagons vertically

  // Add new hexagons after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleHexagons((prev) => [...prev, { row: -1, col: -1 }]); // Add top-left hexagon
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

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
          // Calculate position based on grid coordinates
          const xOffset = position.col * horizontalSpacing;
          const yOffset =
            position.row * verticalSpacing + (position.col % 2 !== 0 ? hexHeight / 2 : 0);

          return (
            <Fade key={`${position.row}-${position.col}`} in={true} timeout={1000}>
              <Box
                sx={{
                  position: "absolute",
                  left: `calc(50% + ${xOffset}px)`,
                  top: `calc(50% + ${yOffset}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg width={hexWidth} height={hexHeight} viewBox="0 0 100 100">
                  <polygon
                    points="90,50 70,85.98 30,85.98 10,50 30,14.02 70,14.02"
                    fill="white"
                    stroke="black"
                    strokeWidth="2"
                  />
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
