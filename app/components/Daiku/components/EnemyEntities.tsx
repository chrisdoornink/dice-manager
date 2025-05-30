import React from 'react';
import { EnemyEntity } from '../utils/types';

// Define Point interface since we don't have direct access to the calculateHexagonCenter module
interface Point {
  x: number;
  y: number;
}

interface EnemyEntitiesProps {
  enemies: EnemyEntity[];
  hexSize: number;
  calculateHexagonCenter: (position: { q: number; r: number }) => Point;
}

export const EnemyEntities: React.FC<EnemyEntitiesProps> = ({
  enemies,
  hexSize,
  calculateHexagonCenter
}) => {
  return (
    <>
      {/* Render enemy entities */}
      {enemies.map((entity) => {
        // Calculate the center of the hexagon where this entity is positioned
        const center = calculateHexagonCenter(entity.position);

        return (
          <div
            key={`enemy-${entity.id}`}
            className="entity enemy"
            style={{
              position: "absolute",
              width: `${hexSize * 0.7}px`,
              height: `${hexSize * 0.7}px`,
              borderRadius: "50%",
              backgroundColor: entity.entityType.color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: `${hexSize * 0.4}px`,
              transform: `translate(${center.x - hexSize * 0.35}px, ${
                center.y - hexSize * 0.35
              }px)`,
              zIndex: 10,
              transition: "transform 0.3s ease-in-out",
              border: '2px solid #ff0000', // Red border for enemy units
              boxShadow: '0 0 8px rgba(255, 0, 0, 0.5)', // Red glow for enemy units
            }}
            onClick={() => {
              // Just show info about the enemy unit for now
              console.log('Enemy clicked:', entity);
            }}
          >
            {entity.entityType.type === "clobbin" && "👹"}
            {entity.entityType.type === "spettle" && "👺"}
            {entity.entityType.type === "skritcher" && "👻"}
            {entity.entityType.type === "whumble" && "👾"}
          </div>
        );
      })}
    </>
  );
};
