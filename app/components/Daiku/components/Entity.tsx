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
  // If entity is defeated, render a gravestone emoji
  if (entity.defeated) {
    return (
      <Box
        sx={{
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px", // Large emoji size
          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
          opacity: 0.9,
          ...style,
        }}
      >
        {/* Gravestone emoji */}
        🪦
      </Box>
    );
  }
  // Determine the appropriate styling based on the entity state
  const getFilter = () => {
    if (isSelected) return "drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 1px #000000)";
    if (isPendingMove) return "drop-shadow(0 0 3px #FFA500) drop-shadow(0 0 1px #000000)";
    if (entity.isEnemy) return "drop-shadow(0 0 5px rgba(239, 0, 0, 0.7))";
    return "drop-shadow(0 0 4px rgba(183, 235, 253, 0.9))";
    // return "none";
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
          width: entity.entityType.spriteSheetSprite?.width,
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
            height: "100%",
            backgroundImage: `url(${entity.entityType.spriteSheetSprite.spritesheet})`,
            backgroundPosition: `-${entity.entityType.spriteSheetSprite.x}px -${entity.entityType.spriteSheetSprite.y}px`,
            backgroundSize: "256px 256px",
            backgroundRepeat: "no-repeat",
            transform: !entity.isEnemy ? "scale(1.3)" : "scale(1.4)", // Player sprites need to be shifted up
            transformOrigin: "center bottom", // Scale from bottom center to keep feet in position
            top: !entity.isEnemy ? "8px" : "0", // Move player sprites up even more
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
      {entity.entityType.type === "mage" && "🧙‍♂️"}
    </Box>
  );
};

export default Entity;
