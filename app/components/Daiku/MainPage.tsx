'use client';

import React from "react";
import { Container, Box } from "@mui/material";

const MainPage = () => {
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
      <Box sx={{ mt: 2 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon 
            points="90,50 70,85.98 30,85.98 10,50 30,14.02 70,14.02"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      </Box>
    </Container>
  );
};

export default MainPage;
