'use client';

import React from "react";
import { Container, Typography, Box, Fade } from "@mui/material";

interface SplashScreenProps {
  onSplashComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onSplashComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSplashComplete();
    }, 2000); // 2 seconds
    
    return () => clearTimeout(timer);
  }, [onSplashComplete]);

  return (
    <Fade in={true} timeout={1000}>
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
          position: "fixed", // Fixed position to overlay
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000, // High z-index to be on top
          backgroundColor: "#fff", // Background color
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Daiku
        </Typography>
        
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
    </Fade>
  );
};

export default SplashScreen;
