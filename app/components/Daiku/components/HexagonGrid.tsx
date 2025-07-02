import React from "react";
import { Box, Fade } from "@mui/material";
import { HexagonData, GridPosition, PlayerEntity, GameEntity } from "../utils/types";
import { getNeighboringTiles } from "../utils/getNeigboringTiles";
import { axialToPixel } from "../utils/hexagonCoordinates";
import HexagonTile from "./HexagonTile";
import EntityRenderer from "./EntityRenderer";

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
  perspectiveValue: number;
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
  getEntityWithPendingMoveTo = () => undefined,
  perspectiveValue,
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
        // Create tabletop perspective illusion with subtle transforms
        transform: `perspective(${perspectiveValue}px) rotateX(5deg)`,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Render all visible hexagons */}
      {visibleHexagons.map((position, index) => {
        // Convert axial coordinates to pixel coordinates using our utility function
        const { x: xPosition, y: yPositionInverted } = axialToPixel(position, hexSize);

        // Determine if this hexagon is in the movement range
        const isInMovementRange =
          selectedEntity &&
          movementRangeHexagons.some((pos) => pos.q === position.q && pos.r === position.r);

        // Determine cursor style based on entity type and movement range
        const cursorStyle = isInMovementRange
          ? selectedEntity?.entityType.type === "archer"
            ? customCursors.archer
            : selectedEntity?.entityType.type === "cavalry"
            ? customCursors.cavalry
            : selectedEntity?.entityType.type === "warrior"
            ? customCursors.warrior
            : selectedEntity?.entityType.type === "mage"
            ? customCursors.mage
            : "crosshair"
          : "pointer";

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
                cursor: cursorStyle,
              }}
              onClick={() => {
                // Only handle tile clicks if we have a selected entity and this tile is in movement range
                if (isInMovementRange) {
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

                {/* Render the hexagon tile with proper styling */}
                <HexagonTile
                  position={position}
                  hexagonPoints={hexagonPoints}
                  getHexagonFillColor={getHexagonFillColor}
                />

                {/* Render entities using the EntityRenderer component */}
                <EntityRenderer
                  position={position}
                  selectedEntity={selectedEntity}
                  getEntityAtPosition={getEntityAtPosition}
                  handleEntityClick={handleEntityClick}
                  pendingMoves={pendingMoves}
                  getEntityWithPendingMoveTo={getEntityWithPendingMoveTo}
                />
              </svg>
            </Box>
          </Fade>
        );
      })}
    </Box>
  );
};

export default HexagonGrid;
