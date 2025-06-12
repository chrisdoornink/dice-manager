import React from "react";
import { GridPosition, PlayerEntity, GameEntity } from "../utils/types";

interface EntityRendererProps {
  position: GridPosition;
  selectedEntity: PlayerEntity | null;
  getEntityAtPosition: (position: GridPosition) => GameEntity | undefined;
  handleEntityClick: (entity: GameEntity) => void;
  pendingMoves: Map<string, GridPosition>;
  getEntityWithPendingMoveTo: (position: GridPosition) => PlayerEntity | undefined;
}

const EntityRenderer: React.FC<EntityRendererProps> = ({
  position,
  selectedEntity,
  getEntityAtPosition,
  handleEntityClick,
  pendingMoves,
  getEntityWithPendingMoveTo,
}) => {
  // Get entity at this position (if any)
  const entity = getEntityAtPosition(position);

  const getSVGSpriteLocationAdjustment = (currentEntity: GameEntity) => {
    if (currentEntity?.entityType.type === "archer") {
      return { x: 20, y: 0 };
    }

    if (currentEntity?.entityType.type === "spuddle") {
      return { x: 15, y: -5 };
    }

    if (currentEntity?.entityType.type === "skritcher") {
      return { x: 15, y: 5 };
    }

    if (currentEntity?.entityType.type === "whumble") {
      return { x: 10, y: 0 };
    }

    return { x: 0, y: 0 };
  };

  if (selectedEntity === entity) {
    console.log("selectedEntity", selectedEntity);
    console.log("entity", entity);
  }

  // Always show entity at its original position, even if it has a pending move
  if (entity) {
    return (
      <g key={`entity-${entity.id}`}>
        <svg
          x={getSVGSpriteLocationAdjustment(entity).x}
          y={getSVGSpriteLocationAdjustment(entity).y}
          width="100"
          height="100"
          viewBox="0 0 100 100"
          overflow="visible"
        >
          <defs>
            <pattern
              id={`entity-pattern-${entity.id}`}
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href={entity.entityType.spriteSheetSprite?.spritesheet}
                x={entity.entityType.spriteSheetSprite ? -entity.entityType.spriteSheetSprite.x : 0}
                y={entity.entityType.spriteSheetSprite ? -entity.entityType.spriteSheetSprite.y : 0}
                width="340"
                height="340"
                preserveAspectRatio="xMinYMin"
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width={entity.entityType.spriteSheetSprite?.width || "100"}
            height={entity.entityType.spriteSheetSprite?.height || "100"}
            fill={`url(#entity-pattern-${entity.id})`}
            opacity={pendingMoves.has(entity.id) ? 0.7 : 1}
            onClick={(e) => {
              e.stopPropagation();
              handleEntityClick(entity);
            }}
            style={{ cursor: "pointer" }}
          />
        </svg>
      </g>
    );
  }

  // Show ghost preview of pending moves
  const pendingEntity = getEntityWithPendingMoveTo(position);
  if (pendingEntity && pendingEntity.entityType.spriteSheetSprite) {
    return (
      <g key={`ghost-${pendingEntity.id}`}>
        <svg
          x={getSVGSpriteLocationAdjustment(pendingEntity).x}
          y={getSVGSpriteLocationAdjustment(pendingEntity).y}
          width="100"
          height="100"
          viewBox="0 0 100 100"
          overflow="visible"
        >
          <defs>
            <pattern
              id={`ghost-entity-pattern-${pendingEntity.id}`}
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href={pendingEntity.entityType.spriteSheetSprite.spritesheet}
                x={-pendingEntity.entityType.spriteSheetSprite.x}
                y={-pendingEntity.entityType.spriteSheetSprite.y}
                width="340"
                height="340"
                preserveAspectRatio="xMinYMin"
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width={pendingEntity.entityType.spriteSheetSprite?.width || "100"}
            height={pendingEntity.entityType.spriteSheetSprite?.height || "100"}
            fill={`url(#ghost-entity-pattern-${pendingEntity.id})`}
            opacity={0.6}
            style={{ pointerEvents: "none" }}
          />
        </svg>
      </g>
    );
  }

  // No entity at this position
  return null;
};

export default EntityRenderer;
