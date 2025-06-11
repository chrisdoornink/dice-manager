import React from 'react';
import { GridPosition, PlayerEntity, GameEntity } from '../utils/types';
import Entity from './Entity';

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

  // Always show entity at its original position, even if it has a pending move
  if (entity) {
    return (
      <g key={`entity-${entity.id}`}>
        <svg x="0" y="0" width="100" height="100" viewBox="0 0 100 100" overflow="visible">
          <defs>
            <pattern
              id={`entity-pattern-${entity.id}`}
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              <image
                href={entity.entityType.spriteSheetSprite?.spritesheet}
                x={entity.entityType.spriteSheetSprite ? -entity.entityType.spriteSheetSprite.x : 0}
                y={entity.entityType.spriteSheetSprite ? -entity.entityType.spriteSheetSprite.y : 0}
                width="256"
                height="256"
                preserveAspectRatio="xMinYMin"
              />
            </pattern>
          </defs>
          <rect
            x="20" 
            y="20"
            width="60"
            height="60"
            fill={`url(#entity-pattern-${entity.id})`}
            stroke={selectedEntity && selectedEntity.id === entity.id ? "#ffffff" : "none"}
            strokeWidth="2"
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
        <svg x="0" y="0" width="100" height="100" viewBox="0 0 100 100" overflow="visible">
          <defs>
            <pattern
              id={`ghost-entity-pattern-${pendingEntity.id}`}
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              <image
                href={pendingEntity.entityType.spriteSheetSprite.spritesheet}
                x={-pendingEntity.entityType.spriteSheetSprite.x}
                y={-pendingEntity.entityType.spriteSheetSprite.y}
                width="256"
                height="256"
                preserveAspectRatio="xMinYMin"
              />
            </pattern>
          </defs>
          <rect
            x="20" 
            y="20"
            width="60"
            height="60"
            fill={`url(#ghost-entity-pattern-${pendingEntity.id})`}
            stroke="#FFA500"
            strokeWidth="2"
            strokeDasharray="4"
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
