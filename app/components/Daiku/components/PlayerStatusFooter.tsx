import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { PlayerEntity } from "../utils/types";

interface PlayerStatusFooterProps {
  playerEntities: PlayerEntity[];
}

const PlayerStatusFooter: React.FC<PlayerStatusFooterProps> = ({ playerEntities }) => {
  const getFooterSpriteStyle = (entity: PlayerEntity): React.CSSProperties => {
    const spriteData = entity.entityType.spriteSheetSprite;
    if (!spriteData) return {}; // Should not be reached if spriteSheetSprite exists

    // Default styles based on current implementation
    let divWidth = "30px";
    let divHeight = "70px";
    let backgroundPosition = spriteData.singleImage
      ? "center center"
      : `-${spriteData.x / 5}px -${spriteData.y / 5}px`;
    let backgroundSize = spriteData.singleImage
      ? "contain"
      : `${(spriteData.width / 5) * 10}px ${(spriteData.height / 5) * 10}px`;

    // Per-entity type overrides
    switch (entity.entityType.type) {
      case "archer":
        divWidth = "25px";
        backgroundPosition = `-53px -20px`;
        break;
      case "cavalry":
        divWidth = "40px"; // Cavalry are often wider
        backgroundPosition = `-34px -20px`;
        break;
      case "infantry":
        backgroundPosition = `-0px -20px`;
        break;
      case "mage":
        backgroundPosition = `-80px -20px`;
        break;
      default:
        // Default case can use the initialized values
        break;
    }

    return {
      width: divWidth,
      height: divHeight,
      backgroundImage: `url(${spriteData.spritesheet})`,
      backgroundPosition,
      backgroundSize,
      backgroundRepeat: "no-repeat",
    };
  };

  // Get the current health of an entity, defaulting to maxHealth if not set
  const getEntityHealth = (entity: PlayerEntity): number => {
    if (entity.entityType.currentHealth !== undefined) {
      return entity.entityType.currentHealth;
    }
    return entity.entityType.maxHealth || 3; // Default to 3 if maxHealth is not defined
  };

  // Get the maximum health of an entity, defaulting to 3 if not set
  const getMaxHealth = (entity: PlayerEntity): number => {
    return entity.entityType.maxHealth || 3;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "30px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        padding: "5px 10px",
        borderRadius: "4px",
        margin: "0 auto 20px auto",
      }}
    >
      {playerEntities.map((entity) => (
        <Box
          key={entity.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Unit Sprite */}
          {entity.entityType.spriteSheetSprite ? (
            <div style={getFooterSpriteStyle(entity)} />
          ) : entity.entityType.sprite ? (
            <Image
              src={entity.entityType.sprite}
              alt={entity.entityType.type}
              width={50}
              height={50}
            />
          ) : (
            <Typography variant="h6" sx={{ color: entity.entityType.color }}>
              {entity.entityType.type.charAt(0).toUpperCase()}
            </Typography>
          )}

          {/* Health Hearts */}
          <Box sx={{ display: "flex", marginTop: "5px", flexDirection: "column" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {Array.from({ length: getEntityHealth(entity) }).map((_, index) => {
                return (
                  <span key={index} style={{ marginBottom: "0px" }}>
                    <Image src="/images/entities/heart.png" alt="heart" width={15} height={15} />
                  </span>
                );
              })}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PlayerStatusFooter;
