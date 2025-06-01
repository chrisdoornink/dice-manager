import React from "react";
import { Box } from "@mui/material";
import { GameEntity } from "../utils/types";

export interface EntityProps {
  entity: GameEntity;
  size?: number;
  isGhost?: boolean;
  isSelected?: boolean;
  isPendingMove?: boolean;
  onClick?: (entity: GameEntity) => void;
  style?: React.CSSProperties;
}

/**
 * Entity component for rendering entities consistently across the application
 * Can be used for:
 * - Main board display
 * - Ghost/pending move display
 * - Modal entity info display
 * - Status indicators
 */
const Entity: React.FC<EntityProps> = ({
  entity,
  size = 60,
  isGhost = false,
  isSelected = false,
  isPendingMove = false,
  onClick,
  style = {},
}) => {
  // Determine the appropriate styling based on the entity state
  const getFilter = () => {
    if (isSelected) return "drop-shadow(0 0 3px #ffffff)";
    if (isPendingMove) return "drop-shadow(0 0 3px #FFA500)";
    return "none";
  };

  // Render using the sprite sheet if available
  if (entity.entityType.spriteSheetSprite) {
    return (
      <Box
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(entity);
        }}
        sx={{
          width: "100%",
          height: "100%",
          cursor: onClick ? "pointer" : "default",
          position: "relative",
          overflow: "visible", // Allow sprite to overflow its container
          opacity: isGhost ? 0.5 : 1,
          filter: getFilter(),
          ...style,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%", // Make even taller to show full sprite
            backgroundImage: `url(${entity.entityType.spriteSheetSprite.spritesheet})`,
            backgroundPosition: `-${entity.entityType.spriteSheetSprite.x}px -${entity.entityType.spriteSheetSprite.y}px`,
            backgroundSize: "256px 256px",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.5)", // Scale up to fill more of the tile
            transformOrigin: "center bottom", // Scale from bottom center to keep feet in position
          }}
        />
      </Box>
    );
  }

  // Fallback to the color circle with icon if no sprite sheet
  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(entity);
      }}
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: entity.entityType.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: `${size / 3}px`,
        fontWeight: "bold",
        cursor: onClick ? "pointer" : "default",
        opacity: isGhost ? 0.5 : 1,
        border: isGhost ? "1.5px dashed #888" : "1px solid rgba(0,0,0,0.2)",
        filter: getFilter(),
        ...style,
      }}
    >
      {entity.entityType.type === "archer" && "🏹"}
      {entity.entityType.type === "cavalry" && "🐎"}
      {entity.entityType.type === "infantry" && "⚔️"}
    </Box>
  );
};

export default Entity;
