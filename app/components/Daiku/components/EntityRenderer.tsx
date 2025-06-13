import React, { useState, useEffect, useRef } from "react";
import { GridPosition, PlayerEntity, GameEntity } from "../utils/types";
import { keyframes } from "@emotion/react";

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

  // Animation states for death effect
  const [isDeathAnimating, setIsDeathAnimating] = useState(false);
  const [showGravestone, setShowGravestone] = useState(false);
  const entityRef = useRef<GameEntity | null>(null);

  // Check if the entity just died (transition from alive to defeated)
  useEffect(() => {
    if (entity && entity.defeated && entityRef.current && !entityRef.current.defeated) {
      // Entity just died, start death animation
      setIsDeathAnimating(true);

      // After animation completes, show gravestone
      setTimeout(() => {
        setIsDeathAnimating(false);
        setShowGravestone(true);
      }, 1500); // Animation duration
    }

    // Store current entity state for comparison in next render
    entityRef.current = entity || null;
  }, [entity]);

  // Always show entity at its original position, even if it has a pending move
  if (entity) {
    // Death animation rendering
    if (entity.defeated && isDeathAnimating) {
      // Calculate sprite position for death animation
      const spriteX = entity.entityType.spriteSheetSprite?.x || 0;
      const spriteY = entity.entityType.spriteSheetSprite?.y || 0;
      const spriteWidth = entity.entityType.spriteSheetSprite?.width || 100;
      const spriteHeight = entity.entityType.spriteSheetSprite?.height || 100;
      const spriteSheet = entity.entityType.spriteSheetSprite?.spritesheet || "";

      return (
        <g key={`entity-death-${entity.id}`}>
          {/* Original entity fading out */}
          <svg
            x={getSVGSpriteLocationAdjustment(entity).x}
            y={getSVGSpriteLocationAdjustment(entity).y}
            width="100"
            height="100"
            viewBox="0 0 100 100"
            overflow="visible"
            opacity="0.8"
            style={{ animation: "fadeOut 1s forwards" }}
          >
            <defs>
              <pattern
                id={`entity-pattern-fade-${entity.id}`}
                patternUnits="userSpaceOnUse"
                width="100"
                height="100"
              >
                <image
                  href={spriteSheet}
                  x={-spriteX}
                  y={-spriteY}
                  width="340"
                  height="340"
                  preserveAspectRatio="xMinYMin"
                />
              </pattern>
            </defs>
            <rect
              x="0"
              y="0"
              width={spriteWidth}
              height={spriteHeight}
              fill={`url(#entity-pattern-fade-${entity.id})`}
            />
          </svg>

          {/* Smoke puffs */}
          <svg
            x={getSVGSpriteLocationAdjustment(entity).x - 10}
            y={getSVGSpriteLocationAdjustment(entity).y - 10}
            width="120"
            height="120"
            viewBox="0 0 120 120"
            overflow="visible"
          >
            <circle cx="30" cy="90" r="10" fill="white" opacity="0.8">
              <animate attributeName="cy" from="90" to="40" dur="1.5s" fill="freeze" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" fill="freeze" />
              <animate attributeName="r" from="5" to="15" dur="1.5s" fill="freeze" />
            </circle>
            <circle cx="50" cy="90" r="10" fill="white" opacity="0.8">
              <animate attributeName="cy" from="90" to="30" dur="1.2s" fill="freeze" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" fill="freeze" />
              <animate attributeName="r" from="7" to="18" dur="1.2s" fill="freeze" />
            </circle>
            <circle cx="70" cy="90" r="10" fill="white" opacity="0.8">
              <animate attributeName="cy" from="90" to="35" dur="1.3s" fill="freeze" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.3s" fill="freeze" />
              <animate attributeName="r" from="6" to="16" dur="1.3s" fill="freeze" />
            </circle>
          </svg>

          {/* Rising spirit */}
          <svg
            x={getSVGSpriteLocationAdjustment(entity).x + 25}
            y={getSVGSpriteLocationAdjustment(entity).y + 50}
            width="50"
            height="80"
            viewBox="0 0 50 80"
            overflow="visible"
          >
            <path
              d="M25,70 Q35,60 25,50 Q15,40 25,30 Q35,20 25,10 Q15,0 25,0"
              stroke="white"
              strokeWidth="8"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            >
              <animate attributeName="y" from="0" to="-100" dur="1.5s" fill="freeze" />
              <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" fill="freeze" />
            </path>
          </svg>
        </g>
      );
    }

    // Show gravestone after animation completes or if we're not animating
    if (entity.defeated && (showGravestone || !isDeathAnimating)) {
      if (!entity.isEnemy) {
        return (
          <g key={`entity-${entity.id}`}>
            <svg x={0} y={0} width="100" height="100" viewBox="0 0 100 100" overflow="visible">
              <defs>
                <pattern
                  id={`entity-pattern-${entity.id}`}
                  patternUnits="userSpaceOnUse"
                  width="100"
                  height="100"
                >
                  <image
                    href={"/images/entities/death.png"}
                    x={10}
                    y={20}
                    width="140"
                    height="140"
                    preserveAspectRatio="xMinYMin"
                  />
                </pattern>
              </defs>
              <rect
                x="10"
                y="20"
                width={"70"}
                height={"70"}
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
      } else {
        return (
          <g key={`entity-${entity.id}`}>
            <svg x={10} y={30} width="100" height="100" viewBox="0 0 100 100" overflow="visible">
              <defs>
                <pattern
                  id={`entity-pattern-${entity.id}`}
                  patternUnits="userSpaceOnUse"
                  width="100"
                  height="100"
                >
                  <image
                    href={"/images/entities/death.png"}
                    x={-10}
                    y={-75}
                    width="160"
                    height="150"
                    preserveAspectRatio="xMinYMin"
                  />
                </pattern>
              </defs>
              <rect
                x="0"
                y="0"
                width={"80"}
                height={"100"}
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
    }

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

// Add keyframe animations for death effects
const deathAnimations = `
  @keyframes fadeOut {
    from { opacity: 0.8; }
    to { opacity: 0; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes expand {
    from { transform: scale(1); opacity: 0.8; }
    to { transform: scale(2); opacity: 0; }
  }
`;

// Add style tag with animations to the component
const DeathAnimationStyles = () => {
  return <style>{deathAnimations}</style>;
};

const EntityRendererWithAnimations = (props: EntityRendererProps) => {
  return (
    <>
      <DeathAnimationStyles />
      <EntityRenderer {...props} />
    </>
  );
};

export default EntityRendererWithAnimations;
