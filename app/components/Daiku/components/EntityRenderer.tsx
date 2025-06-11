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
        <foreignObject x="10" y="-10" width="80" height="130">
          <Entity
            entity={entity}
            isSelected={!!(selectedEntity && selectedEntity.id === entity.id)}
            isPendingMove={pendingMoves.has(entity.id)}
            onClick={(entity: GameEntity) => handleEntityClick(entity)}
          />
        </foreignObject>
      </g>
    );
  }

  // Show ghost preview of pending moves
  const pendingEntity = getEntityWithPendingMoveTo(position);
  if (pendingEntity) {
    return (
      <g key={`ghost-${pendingEntity.id}`}>
        <foreignObject x="10" y="-10" width="80" height="130">
          <Entity entity={pendingEntity} isGhost={true} isPendingMove={true} />
        </foreignObject>
      </g>
    );
  }

  // No entity at this position
  return null;
};

export default EntityRenderer;
