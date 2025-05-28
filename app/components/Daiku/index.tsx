'use client';

import React from "react";
import { Container, Typography } from "@mui/material";

const Daiku = () => {
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
      <Typography variant="h2" component="h1" gutterBottom>
        Daiku
      </Typography>
    </Container>
  );
};

export default Daiku;
