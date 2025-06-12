import React from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { PlayerEntity } from "../utils/types";
import EntityRenderer from "./EntityRenderer";

// Component for displaying selected entity info
export const EntityInfoPanel = ({ selectedEntity }: { selectedEntity: PlayerEntity | null }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Toggle panel visibility
  const togglePanel = () => setIsOpen(!isOpen);

  if (!selectedEntity) return null;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-block",
        zIndex: 1000,
      }}
    >
      {/* Info icon toggle button */}
      <IconButton
        onClick={togglePanel}
        sx={{
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {isOpen ? <CloseIcon /> : <InfoIcon />}
      </IconButton>

      {/* Collapsible panel */}
      <Collapse in={isOpen} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            width: "250px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "15px",
            borderRadius: "5px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            right: 0,
            top: "45px", // Position below the header
            zIndex: 1100,
            maxHeight: "calc(100vh - 150px)", // Ensure it doesn't exceed viewport height
            overflowY: "auto", // Add scrolling if content is too tall
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <Box
              sx={{
                width: selectedEntity.entityType.spriteSheetSprite?.width,
                height: "120px",
                marginRight: "10px",
                position: "relative",
                overflow: "visible",
              }}
            >
              <EntityRenderer
                position={selectedEntity.position}
                selectedEntity={selectedEntity}
                getEntityAtPosition={() => selectedEntity}
                handleEntityClick={() => {}}
                pendingMoves={new Map()}
                getEntityWithPendingMoveTo={() => selectedEntity}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", textTransform: "capitalize" }}
              >
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
      </Collapse>
    </Box>
  );
};
