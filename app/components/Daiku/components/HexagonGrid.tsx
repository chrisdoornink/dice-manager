import React from 'react';
import { Box, Fade } from '@mui/material';
import { HexagonData, GridPosition, PlayerEntity, GameEntity } from '../utils/types';
import Entity from './Entity';
import { getNeighboringTiles } from '../utils/getNeigboringTiles';

interface HexagonGridProps {
  visibleHexagons: HexagonData[];
  hexSize: number;
  hexWidth: number;
  hexHeight: number;
  hexagonPoints: string;
  customCursors: { [key: string]: string };
  selectedEntity: PlayerEntity | null;
  movementRangeHexagons: GridPosition[];
  hoveredHexagon: HexagonData | null;
  setHoveredHexagon: (hexagon: HexagonData | null) => void;
  setHighlightedNeighbors: (neighbors: GridPosition[]) => void;
  handleTileSelection: (position: HexagonData) => void;
  getEntityAtPosition: (position: GridPosition) => GameEntity | undefined;
  handleEntityClick: (entity: GameEntity) => void;
  getHexagonFillColor: (position: HexagonData) => string;
  pendingMoves?: Map<string, GridPosition>;
  getEntityWithPendingMoveTo?: (position: GridPosition) => PlayerEntity | undefined;
}

const HexagonGrid: React.FC<HexagonGridProps> = ({
  visibleHexagons,
  hexSize,
  hexWidth,
  hexHeight,
  hexagonPoints,
  customCursors,
  selectedEntity,
  movementRangeHexagons,
  hoveredHexagon,
  setHoveredHexagon,
  setHighlightedNeighbors,
  handleTileSelection,
  getEntityAtPosition,
  handleEntityClick,
  getHexagonFillColor,
  pendingMoves = new Map(),
  getEntityWithPendingMoveTo = () => undefined
}) => {
  return (
    <Box
      data-testid="the-board"
      sx={{
        position: "relative",
        width: "100%",
        height: "100%", // Take full height of parent container
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        boxSizing: "border-box",
      }}
    >
      {/* Render all visible hexagons */}
      {visibleHexagons.map((position, index) => {
        // Convert axial coordinates to pixel coordinates for flat-topped hexagons
        // Formula for flat-top hexagons in axial coordinates
        // The spacing factor controls how close hexagons are packed
        // Lower values = tighter packing (but don't go below 1.5 for horizontal)
        const horizontalSpacingFactor = 1.5; // Standard is 1.5 for perfect hexagonal packing
        const verticalSpacingFactor = Math.sqrt(3); // Standard is sqrt(3) for perfect packing

        const xPosition = hexSize * (horizontalSpacingFactor * position.q);
        const yPosition =
          hexSize *
          ((verticalSpacingFactor / 2) * position.q + verticalSpacingFactor * position.r);

        // Invert y-position to make positive r go upward
        const yPositionInverted = -yPosition;

        return (
          <Fade key={`${position.q}-${position.r}-${index}`} in={true} timeout={200}>
            <Box
              data-testid="the-hexagon"
              sx={{
                position: "absolute",
                left: `calc(50% + ${xPosition}px)`,
                top: `calc(50% + ${yPositionInverted}px)`,
                transform: "translate(-50%, -50%)",
                maxWidth: "100%",
                maxHeight: "100%",
                cursor:
                  selectedEntity &&
                  movementRangeHexagons.some(
                    (pos) => pos.q === position.q && pos.r === position.r
                  )
                    ? selectedEntity.entityType.type === "archer"
                      ? customCursors.archer
                      : selectedEntity.entityType.type === "cavalry"
                      ? customCursors.cavalry
                      : selectedEntity.entityType.type === "infantry"
                      ? customCursors.infantry
                      : "crosshair"
                    : "pointer", // Custom cursor based on unit type for valid movement targets
              }}
              onClick={() => {
                // Only handle tile clicks if we have a selected entity and this tile is in movement range
                if (
                  selectedEntity &&
                  movementRangeHexagons.some(
                    (pos) => pos.q === position.q && pos.r === position.r
                  )
                ) {
                  handleTileSelection(position);
                }
              }}
              onMouseEnter={() => {
                setHoveredHexagon(position);
                setHighlightedNeighbors(getNeighboringTiles(position));
              }}
              onMouseLeave={() => {
                setHoveredHexagon(null);
                setHighlightedNeighbors([]);
              }}
            >
              <svg
                width={hexWidth}
                height={hexHeight}
                viewBox="0 0 100 100"
                style={{ display: "block" }} // Remove any default spacing
              >
                <defs>
                  <clipPath id={`hexClip-${position.q}-${position.r}`}>
                    <polygon points={hexagonPoints} />
                  </clipPath>
                </defs>

                {/* For water and grass tiles, add the image as a repeating pattern */}
                {(position.terrain.type === "water" || position.terrain.type === "grass") &&
                  position.terrain.backgroundImage && (
                    <>
                      <defs>
                        <pattern
                          id={`terrain-pattern-${position.q}-${position.r}`}
                          patternUnits="userSpaceOnUse"
                          width="50"
                          height="50"
                          patternTransform="scale(1.5)"
                        >
                          <image
                            href={position.terrain.backgroundImage}
                            x="0"
                            y="0"
                            width="50"
                            height="50"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </pattern>
                      </defs>
                      <polygon
                        points={hexagonPoints}
                        fill={`url(#terrain-pattern-${position.q}-${position.r})`}
                        fillOpacity={
                          position.terrain.patternOpacity !== undefined
                            ? position.terrain.patternOpacity
                            : 1
                        }
                        clipPath={`url(#hexClip-${position.q}-${position.r})`}
                      />
                    </>
                  )}

                {/* Define the hexagon shape with a stroke */}
                <polygon
                  points={hexagonPoints}
                  fill={getHexagonFillColor(position)}
                  fillOpacity={
                    position.terrain.type === "water" || position.terrain.type === "grass"
                      ? "0.6"
                      : "1"
                  }
                  strokeWidth="3"
                  stroke="#374d22"
                />

                {/* Render forest sprites from sprite sheet - simpler method */}
                {position.terrain.spriteSheetSprite && (
                  <foreignObject
                    x="5"
                    y="5"
                    width="90"
                    height="90"
                    clipPath={`url(#hexClip-${position.q}-${position.r})`}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${position.terrain.spriteSheetSprite.spritesheet})`,
                        backgroundPosition: position.terrain.spriteSheetSprite.singleImage
                          ? `center center`
                          : `-${position.terrain.spriteSheetSprite.x / 3}px -${
                              position.terrain.spriteSheetSprite.y / 3
                            }px`,
                        backgroundSize: position.terrain.spriteSheetSprite.singleImage
                          ? "cover"
                          : "342px 342px",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </foreignObject>
                )}
                
                {/* Render entity at this position */}
                {(() => {
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

                  return null;
                })()}
              </svg>
            </Box>
          </Fade>
        );
      })}
    </Box>
  );
};

export default HexagonGrid;
