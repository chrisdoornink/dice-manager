import React from 'react';
import { HexagonData } from '../utils/types';

interface HexagonTileProps {
  position: HexagonData;
  hexagonPoints: string;
  getHexagonFillColor: (position: HexagonData) => string;
}

const HexagonTile: React.FC<HexagonTileProps> = ({
  position,
  hexagonPoints,
  getHexagonFillColor,
}) => {
  return (
    <>
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
    </>
  );
};

export default HexagonTile;
