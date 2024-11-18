"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            color: theme.labelText,
            backgroundColor: theme.background,
            boxShadow: 2,
            "&:hover": {
              backgroundColor: theme.background,
            },
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle;
