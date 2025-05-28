import React from "react";
import { Box, Typography } from "@mui/material";
import { PlayerEntity } from "../utils/types";

// Component for displaying selected entity info
export const EntityInfoPanel = ({ selectedEntity }: { selectedEntity: PlayerEntity | null }) => {
  if (!selectedEntity) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "250px",
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "15px",
        borderRadius: "5px",
        zIndex: 1000,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <Box
          sx={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: selectedEntity.entityType.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
          }}
        >
          {selectedEntity.entityType.type === "archer"
            ? "🏹"
            : selectedEntity.entityType.type === "cavalry"
            ? "🐎"
            : selectedEntity.entityType.type === "infantry"
            ? "⚔️"
            : ""}
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
            {selectedEntity.entityType.type}
          </Typography>
          <Typography variant="body2">ID: {selectedEntity.id}</Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ marginBottom: "5px" }}>
        Position: ({selectedEntity.position.q}, {selectedEntity.position.r})
      </Typography>

      <Typography variant="body2" sx={{ marginBottom: "5px" }}>
        Movement: {selectedEntity.entityType.movement} tiles per turn
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", marginTop: "10px" }}>
        Abilities:
      </Typography>

      <Box component="ul" sx={{ marginTop: "5px", paddingLeft: "20px" }}>
        {Object.entries(selectedEntity.entityType.abilities).map(([ability, hasAbility]) => {
          if (!hasAbility) return null;
          return (
            <Typography component="li" variant="body2" key={ability}>
              {ability
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .replace(/([a-z])([A-Z])/g, "$1 $2")}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};
